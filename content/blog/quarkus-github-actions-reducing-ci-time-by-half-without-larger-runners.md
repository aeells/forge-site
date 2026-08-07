---
title: "Quarkus + GitHub Actions: Reducing CI Time by 50% Without Larger Runners"
slug: quarkus-github-actions-reducing-ci-time-by-half-without-larger-runners
summary: "Our GitHub Actions build-and-test workflow went from ~9–11 minutes to about 5:20. Here is what actually moved the needle on a Quarkus multi-module monorepo, and what looked clever but barely helped."
description: "A walkthrough of how we cut Backbone's 02-build-test workflow roughly in half: LocalStack to Floci, fewer Quarkus boots, infrastructure-aware integration job splits, Temurin instead of Graal for non-native CI, and skipping quarkus:build when @QuarkusTest does not need a runner jar, with Maven wall-clock lines taken from real GitHub Actions logs."
published: 2026-08-06
updated: 2026-08-06
author: Andrew Eells
tags: [devops, ci-cd, quarkus, maven, github-actions, floci]
---

Our Quarkus monorepo CI pipeline had plateaued at **9–11 minutes** on GitHub Actions free-tier hosted runners.

After a focused optimisation pass, it now completes in **about 5 minutes 20 seconds**, **without** self-hosted runners, larger GitHub runners, or paid caching products.

The key discovery was that the remaining time was **not** in dependency downloads or Maven compilation. It was in **duplicate Quarkus work**: repeated augmentation, repeated application boots, and infrastructure startup that some test suites did not actually need.

This post walks through the changes that produced the biggest gains, the ones that barely moved the needle, and the final workflow shape.

## The baseline was already heavily optimised

Before touching anything, the workflow already had:

- Reactor parallelism via `.mvn/maven.config` (`--threads=2C`)
- Maven Build Cache extension for local incremental builds
- Surefire and Failsafe configured for `parallel=classes` with an explicit thread count
- A split **build → artifact restore → test** shape so test jobs did not rebuild the world
- Parallel composite setup where it was safe (JDK + tooling overlapping other preparation)

That matters, because it changes the question from *"how do we make Maven faster?"* to *"what is still dominating wall clock after the obvious tuning is already in place?"*.

## Where we started

Backbone's platform repository is a Maven multi-module Quarkus monorepo: shared libraries, several application services, a BFF API, UI modules, and scaffold code. The module names below (`actor`, `audit`, `auth-service`, etc.) are illustrative; the important point is the **shape** of the reactor rather than the specific repo layout.

A rough `cloc` of the parts CI actually cares about (Java, YAML, shell; excluding `target`, `node_modules`, etc.) lands around **~24k lines of code**, including **~14k Java** across roughly **300 source files**. Big enough that cold Quarkus boots matter; small enough that a vanity matrix of one job per module mostly pays setup tax.

The critical workflow looked like this:

1. **build**: `mvn install -DskipTests`, upload jars/classes/local `io.backbone` artifacts
2. **unit-test**: Surefire against the restored reactor
3. **integration-test**: Failsafe `@QuarkusTest` classes with local AWS emulation and/or Postgres

A representative run before the major changes looked like this:

| Job | Wall clock |
| --- | --- |
| build | ~2.5 min |
| int-test | ~8.5 min |
| **workflow** | **~11.4 min** |

The optimisation target was the **end-to-end workflow wall clock** (checkout through reporters), not a single Maven invocation in isolation.

One integration-test `verify` invocation reported:

```text
[INFO] Total time:  02:09 min (Wall Clock)
```

If Maven itself said **2 minutes** while the workflow still took **10–11 minutes**, the missing time was clearly **job setup, emulator startup, artifact restore, and Quarkus application boots**. That observation ended up driving almost every useful optimisation that followed.

## The wrong instinct: copy the ECS deploy matrix

We already parallelise ECS deploys with a GitHub Actions matrix, so the obvious idea was *"one integration-test job per service"*.

That would have been a mistake.

Each matrix cell would have re-paid:

- JDK and tool setup
- Artifact download
- AWS emulator startup
- Cognito / DynamoDB / S3 seeding where required
- Postgres startup where required

We only had a handful of integration-test classes. Fixed setup cost multiplied by N shards usually loses to **one job that pays setup once and parallelises the Maven reactor internally**.

So we kept the job count small and focused on **eliminating duplicated work inside the existing jobs**.

## Prerequisite: LocalStack → Floci

Before this CI pass, we had already migrated from [LocalStack](https://localstack.cloud/) to [Floci](https://floci.io/floci/) as the local AWS emulator on `:4566`.

The original motivation was **Cognito support**, not CI speed. LocalStack Community did not provide a credible Cognito story for our authentication flows, so auth integration tests previously required a **real AWS-backed job** alongside a LocalStack-backed job for the other services.

Floci supports enough of Cognito for our password, refresh-token, and JWT flows that we could collapse those two worlds into a **single local emulator**.

It was also noticeably lighter in CI.

### LocalStack startup (older run)

| Step | Wall clock |
| --- | --- |
| `./.github/actions/localstack` | ~49 s |

### Floci startup (current run)

```text
floci start --detach --image floci/floci:1.5.34
floci wait --timeout 2m
...
Waiting... (119s remaining)   Floci AWS is ready (http://localhost:4566)
```

The entire start-and-wait sequence completed in **about 16 seconds**.

Smaller footprint, no auth-token tax for CI, and Cognito in the same process that already emulates DynamoDB, S3, and SES. That consolidation mattered more than the raw startup-time improvement.

The migration was not entirely frictionless. Floci's `InitiateAuth` + `REFRESH_TOKEN_AUTH` path initially accepted invalid refresh tokens and minted new JWTs, which broke our negative-path authentication tests. We filed [floci-io/floci#2113](https://github.com/floci-io/floci/issues/2113), and it quickly attracted two fix PRs ([#2132](https://github.com/floci-io/floci/pull/2132) and [#2135](https://github.com/floci-io/floci/pull/2135)). That kind of maintainer response is exactly what makes an emulator migration feel safe rather than lonely.

## Step 1: actually forward the Maven flags

CI had been invoking:

```bash
task test:integration -- -Dtest.thread.count=2
```

but the Task definition never forwarded `{{.CLI_ARGS}}`, so Failsafe never saw the thread-count override.

After fixing that, we enabled reactor parallelism for the integration-test invocation:

```bash
task test:integration -- -Dtest.thread.count=2 -T 1C
```

This helped, but only modestly. The dominant cost was still **Quarkus application startup**, not Maven's ability to schedule modules concurrently.

## Step 2: treat Quarkus boots as a budget

Every `@QuarkusTest` class pays for an application start. Once we started looking at boots as a **finite budget**, several easy wins appeared.

### What changed

- **Excluded scaffold integration tests from CI**: `template-service` remains in-tree as a scaffold, but CI no longer boots Quarkus for a module that rarely changes.
- **Merged overlapping integration tests**: notification unsubscribe coverage moved into `NotificationResourceIT`; Cognito user and service cases became nested tests under a single `CognitoAuthenticationProviderIT` so they share one application boot.
- **Demoted thin HTTP integration tests to unit tests**: `DocumentResourceIT` became focused unit tests around the Tika, S3, and DynamoDB behaviour we actually cared about.

The suite still provided meaningful coverage, but we were no longer starting Quarkus for every historical convenience test class.

At this point the full workflow was down to **roughly 9.5 minutes**: an improvement, but nowhere near the eventual 5-minute target.

## Step 3: split integration tests by infrastructure

The remaining integration tests naturally separated into two infrastructure groups:

| Job | Infrastructure | Modules |
| --- | --- | --- |
| `int-auth-test` | Floci + Cognito seed | `auth-service` |
| `int-rest-test` | Postgres | `actor`, `audit`, `notification` |

The important observation was that **auth tests did not need Postgres**, and the REST-resource tests did not need DynamoDB template seeds or Cognito setup.

So we stopped starting **Floci and Postgres in the same job**, and we stopped seeding notification templates when nothing in the test suite actually read them.

The critical-path shape changed from:

```text
build + (Floci + Postgres + all ITs serially)
```

to:

```text
build + max(unit, int-auth, int-rest)
```

That was the first optimisation that made the workflow feel **dramatically** shorter, bringing it down to **around 6.5 minutes**.

A useful side note: avoid parallelising `shell-tools` (which uses `apt`) with `postgres` (which also uses `apt`). That turned into a classic package-manager lock race. Floci was safe to overlap with Temurin and shell-tool setup because it does not compete for `apt` locks.

## Step 4: stop using Graal where you are not building native images

Native-image builds still require GraalVM. Unit tests and `@QuarkusTest` do not.

We introduced a **Temurin 25 composite action** for all non-native workflows and kept GraalVM only on the ECR native-image pipeline.

This was not a massive wall-clock win (roughly **20 seconds**), but it reduced runner setup overhead and removed a surprising amount of cognitive noise from the workflow definitions.

## Step 5: make CI install skip `quarkus:build`

This was the cleanest Maven optimisation in the entire exercise.

A normal Quarkus `mvn install` performs **package-time augmentation**. Our test jobs restore artifacts and then run `@QuarkusTest`, which boots directly from the **test classpath**. They do **not** need the production runner jar produced by the build job.

So the CI install step became:

```bash
mvn install -Dmaven.test.skip -Dquarkus.build.skip=true \
  -pl '!libs/reactor,!ui,!ui/web-actor,!services/template-service' -am
```

The logs changed from multi-minute Quarkus augmentation phases to a stream of:

```text
[INFO] Skipping Quarkus build
[INFO] Skipping Quarkus build
...
[INFO] Total time:  31.650 s (Wall Clock)
```

The **build job** dropped from roughly **2 minutes** to about **80 seconds**, which removed a substantial chunk of the remaining critical path.

Excluding `ui`, `web-actor`, and `template-service` from the CI install reactor also mattered. Those modules were simply **not what `02-build-test` was trying to validate on every push**. One small Maven quirk worth noting: excluding `!ui` alone is insufficient; Maven will still include the child module unless you also exclude `!ui/web-actor`.

## Step 6: run Failsafe without packaging again

After the install phase stopped producing runner jars, the integration-test jobs were still invoking `verify`, which re-entered `package` and `quarkus:build` for the service modules.

For `@QuarkusTest`, that was pure wasted heat.

The integration-test invocation became:

```bash
mvn -pl services/auth-service \
  test-compile \
  failsafe:integration-test failsafe:verify \
  -DskipUnitTests
```

A recent auth-job run reported:

```text
[INFO] BUILD SUCCESS
[INFO] Total time:  01:21 min (Wall Clock)
```

We experimented with dropping `-am` after artifact restore first. That cleaned up the reactor graph, but it barely moved wall clock because the upstream jars were relatively cheap.

The **real lever** was skipping package-time augmentation during `install`; **Failsafe-without-package** was the complementary optimisation on the test side.

## The finish line

A current green run of `02-build-test` on `main` looks roughly like this:

| Job | Wall clock |
| --- | --- |
| build | ~1.3 min |
| int-rest-test | ~2.8 min |
| int-auth-test | ~3.7 min |
| unit-test | ~3.1 min |
| **workflow** | **~5.5 min** |

That is **roughly half of where we started**, and the number developers actually experience day-to-day is **"about five minutes twenty"**.

## What barely moved the needle

This is the section I wish more CI optimisation posts included. These ideas sounded promising during planning, but they were **not** the reason the pipeline got fast:

- **Maven `-T` by itself**: useful, but not transformative once Quarkus boots dominate.
- **Dropping `-am` after artifact restore**: cleaner reactor hygiene, only a few seconds of savings.
- **Failsafe-without-package after install already skipped `quarkus:build`**: a real improvement, but smaller than the install-phase optimisation.
- **Persisting Maven Build Cache in GitHub Actions**: still on the shelf; `actions/setup-java` caches `~/.m2/repository`, not `~/.m2/build-cache`, so the extension kept writing cache entries without ever reading them across workflow runs.

We stopped when the next ideas started looking like **"fewer services"** or **"don't boot Quarkus at all"**, which would have traded away the confidence the pipeline exists to provide.

## The patterns worth stealing

If I had to compress the whole exercise into five transferable lessons:

1. **Budget Quarkus boots.** Merge overlapping tests, demote HTTP-thin integration tests, and exclude scaffold modules from CI.
2. **Split jobs by infrastructure requirements, not by module count.** Auth + Floci versus REST + Postgres beat six tiny jobs that each restarted the world.
3. **Match the JDK to the work.** GraalVM for native-image builds; Temurin for everything else.
4. **Do not package what `@QuarkusTest` will rebuild anyway.** `-Dquarkus.build.skip=true` during CI install is boring, reliable, and surprisingly effective.
5. **Choose an emulator that covers the awkward service.** Floci's Cognito support let us delete an entire AWS-shaped CI job category, not merely shave a few seconds off container startup.

The final result was less about discovering a clever Maven flag and more about **refusing to pay for the same Quarkus application three times on the way to asserting a single HTTP status code**.

We'll happily take **five minutes twenty**.
