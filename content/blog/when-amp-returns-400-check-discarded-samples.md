---
title: "AMP Remote Write HTTP 400: The CloudWatch Metric That Solved It"
slug: when-amp-returns-400-check-discarded-samples
summary: "Intermittent Amazon Managed Prometheus remote-write failures looked like encoding or signing bugs. The real signal was CloudWatch DiscardedSamples — and the fix was embarrassingly familiar if you've operated Prometheus at scale."
description: "How we debugged intermittent AMP remote-write 400 errors on GraalVM ECS tasks: ruling out URL, SigV4, and Snappy, finding new-value-for-timestamp in CloudWatch, and fixing fleet-wide series collisions with Micrometer common tags."
published: 2026-07-03
updated: 2026-07-03
author: Andrew Eells
tags: [devops, aws, observability, prometheus, micrometer]
---

AMP said 400. CloudWatch said why.

We turned on Amazon Managed Prometheus (AMP) remote write from our Quarkus services on ECS — Micrometer snapshots, Snappy-compressed Prometheus remote write, SigV4 signing — and everything *mostly* worked.

Mostly.

Every service logged `AMP remote write failed with status 400` on a ~60 second cadence. Not constantly. Not only at startup. Intermittently, across the fleet, continually.

HTTP 400 with an empty body is a frustrating place to start.

This post is how we narrowed it down, why the obvious suspects weren't the culprit, and the CloudWatch metric that finally made the failure mode obvious.

## The setup

Backbone pushes application metrics in-process:

- **Micrometer** with the Prometheus v1 registry (`/q/metrics` for local scrape, `MetricSnapshots` for export)
- **Remote write** to AMP over HTTPS with `Content-Encoding: snappy` and AWS SigV4 (`aps` signing name)
- **One AMP workspace** shared by every ECS service in the environment (auth, actor, document, notification, audit, BFF, …)
- **GraalVM native** images on Fargate, private subnets, no collector sidecar

The architecture is deliberate: fewer moving parts, right-sized tasks, metrics, and traces exported directly from the app.

When remote write misbehaves, the failure is somewhere in a short chain: scrape → encode → compress → sign → POST.

## What we ruled out first

### Wrong URL

A previous deploy had pointed at the wrong path suffix. AMP's real endpoint is:

```text
https://aps-workspaces.<region>.amazonaws.com/workspaces/<ws-id>/api/v1/remote_write
```

Not `.../remote_write` alone (that returned 404).

We verified the CloudFormation export, the ECS task environment variable, and a **SigV4-signed POST with an empty Snappy payload** to the correct URL. That returned **200**. So URL and IAM were fine.

### SigV4 and transport

The same signing code path used in production (`AwsSignedHttpTransport`) worked from a JVM probe on a developer machine against the live workspace. Empty payload and full payload both succeeded when credentials and URL were correct.

### "A bad metric family"

We scraped live exposition text from a running native task (more on that pattern below), loaded it into a JVM integration test, encoded it with the same remote-write encoder, and POSTed to AMP.

**200. Full payload accepted.**

So the metric *content* at scrape time was not inherently toxic. The encoder and Snappy path on JVM were fine.

That left something about the **native periodic push path** or **fleet-wide ingestion behaviour** — not a single broken histogram hiding in auth-service.

## The pivot: CloudWatch `DiscardedSamples`

AMP exposes [vended CloudWatch metrics](https://docs.aws.amazon.com/prometheus/latest/userguide/AMP-CW-usage-metrics.html) under the `AWS/Prometheus` namespace. One of them is **`DiscardedSamples`**, with a **`Reason` dimension** explaining why samples were dropped.

We listed metrics for our workspace:

```bash
aws cloudwatch list-metrics \
  --namespace "AWS/Prometheus" \
  --metric-name "DiscardedSamples" \
  --region us-west-2
```

The only reason showing material volume:

```text
Reason = new-value-for-timestamp
```

Querying that dimension:

```bash
aws cloudwatch get-metric-statistics \
  --namespace "AWS/Prometheus" \
  --metric-name "DiscardedSamples" \
  --dimensions \
    Name=Workspace,Value=ws-xxxxxxxx \
    Name=Reason,Value=new-value-for-timestamp \
  --start-time "$START" --end-time "$END" \
  --period 300 \
  --statistics Sum \
  --region us-west-2
```

We saw **hundreds of discards per five-minute bucket**, sustained, fleet-wide.

That is not a signing bug. It is not Snappy corruption.

In Prometheus remote write semantics, **`new-value-for-timestamp`** means: AMP already has a sample for this **exact time series** (same metric name and label set) at this **exact timestamp**, but the new sample has a **different value**.

In Prometheus, a series is defined by the metric name and its complete label set. If two writers produce identical labels, the backend treats them as one time series regardless of which process produced them.

Same series. Same millisecond. Different number. Rejected.

Once we saw that, the intermittent 400s and the ~95% push success rate (success counter climbing, failure counter occasionally ticking) both made sense: most pushes partially or fully conflicted with other writers or stale timestamps; some requests failed hard at the HTTP layer.

## The actual bug: six services, one series

Each ECS service exports the same Micrometer binders: `jvm_*`, `process_*`, `system_*`, HTTP server metrics, and our own `forge_observability_amp_push_*` counters.

We had **no common tags** — no `service`, no `instance`, no `pod`.

So from AMP's perspective:

```text
auth-service   → jvm_threads_live_threads = 21  @ T
actor-service  → jvm_threads_live_threads = 14  @ T
document-service → jvm_threads_live_threads = 19 @ T
```

That is **one series** (`jvm_threads_live_threads` with identical labels) receiving **different values at the same timestamp** from different tasks, every push interval, forever.

Classic multi-writer collision.

It is the same class of problem as running multiple Prometheus replicas remote-writing the same targets without external labels — except we did it with six application services and one workspace.

### Why the JVM probe didn't catch it

The probe used a **single** scraped exposition file from **one** task. One writer. AMP happily ingested it.

The failure mode only appears when **multiple tasks** push **overlapping label sets** to **one workspace** on the same schedule.

### Why `hasScrapeTimestamp()` wasn't the story

We also suspected stale per-datapoint scrape timestamps from the registry. On JVM Micrometer scrape, **`hasScrapeTimestamp()` was false for every data point** in our tests. The old encoder fell back to `System.currentTimeMillis()` per sample anyway.

Fleet collision fit the CloudWatch evidence better than stale scrape timestamps.

We still normalized to **one batch push timestamp per remote-write request** — correct semantics for periodic push export — but the fix that cleared discards was **disambiguating series**.

## The fix

### 1. Common tags (the real fix)

In forge-kit `forge-metrics`, a CDI `MeterFilter`:

```java
MeterFilter.commonTags(
    Tag.of("service", applicationName),   // quarkus.application.name
    Tag.of("instance", hostName)        // ECS task hostname; override via config
);
```

After deploy, AMP queries looked like:

```promql
forge_observability_amp_push_success_total
jvm_threads_live_threads{service="auth-service"}
count by (service) (jvm_memory_used_bytes)
```

Six services, six distinct label sets. Immediately after deploying the common tags, new `DiscardedSamples{Reason="new-value-for-timestamp"}` buckets dropped to zero across the workspace while historical buckets retained the earlier collisions. No other code changes were required.

### 2. Richer failure logging

`AmpMetricsExporter` had only logged `status 400`. We added **Snappy body size**, **snapshot count**, and **AMP response body** on failure so the next incident doesn't require guesswork.

### 3. Batch push timestamp

Remote-write encoding now stamps every sample in a `WriteRequest` with **one wall-clock time** at export. That is standard push-agent behaviour and avoids mixed timestamps within a single push. It did not replace the need for `service` / `instance` tags.

## How we verified ingestion (not just "no errors")

Empty HTTP failures are necessary but not sufficient. We confirmed data was **stored and queryable**:

```bash
QUERY_ENDPOINT="https://aps-workspaces.us-west-2.amazonaws.com/workspaces/${WORKSPACE_ID}/api/v1/query"

awscurl --service aps --region us-west-2 \
  -X POST "${QUERY_ENDPOINT}" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'query=forge_observability_amp_push_success_total'
```

Success counters for all six workloads, each with `service` and `instance` labels. Failure metric absent (never incremented since deploy). CloudWatch discards at zero post-rollout.

That is the bar: **PromQL returns your series with the labels you expect**, and **DiscardedSamples stays quiet**.

## Appendix: debugging when you can't reach `/q/metrics`

Our laptops can't hit task private IPs in a NAT-less VPC. To compare native exposition with the JVM encoder, we used a one-off Fargate task pattern:

1. Publish a tiny **private ECR** image (`busybox` + `wget`) — Docker Hub and public ECR aren't reachable from the VPC without NAT.
2. Run a task in the cluster that `wget`s `http://<task-private-ip>:8080/q/metrics` (same path the target group uses for health checks).
3. Pull logs into a local file and feed it to a JVM probe (`FORGE_AMP_METRICS_FILE=...`).

We also briefly added a **same-SG ingress on 8080** so the scrape task could reach the service ENI — then **revoked** it after debugging. That rule is not part of normal infra; ALB → task rules stay as designed.

This tooling was valuable for one INT session. We don't plan to keep the scrape image or scripts in the application repo long term — the durable lessons are the **CloudWatch reason dimension**, the **multi-writer tag discipline**, and the **PromQL verification queries**.

## Takeaways

1. **AMP HTTP 400 with an empty body** sends you down a long hallway. **`DiscardedSamples` by `Reason`** is often the door.
2. **`new-value-for-timestamp`** on a shared workspace screams **label collision** — multiple writers, identical series, aligned push intervals.
3. **Micrometer `MeterFilter.commonTags`** with low-cardinality `service` (and `instance` when you scale replicas) is not optional when many processes remote-write to one Prometheus-compatible backend.
4. **Single-service probes prove encoding**, not fleet behaviour. Reproduce collisions with multi-writer thinking.
5. **Confirm consumption** with PromQL and CloudWatch ingestion metrics — not only "the error log stopped."

If you're wiring Micrometer → AMP on ECS, check your tags before you tune Snappy JNI or second-guess your SigV4 implementation.

The platform was fine. We were just telling six services to sign the same name on the same line.
