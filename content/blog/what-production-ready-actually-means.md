---
title: "What \"production-ready\" actually means - and why most teams discover it too late."
slug: what-production-ready-actually-means
summary: "Production readiness isn't about whether a system runs. It's about how it behaves under failure, change, and scale - and most teams discover the gap too late."
description: "Production readiness is not about functionality. It's about behaviour under failure, change and scale - and why teams discover the operational gap too late."
published: 2026-06-06
updated: 2026-06-06
author: Andrew Eells
tags: [startup, devops, microservices, aws]
canonicalSource: "https://dev.to/aeells/what-production-ready-actually-means-and-why-most-teams-discover-it-too-late-20ha"
---

"Production-ready" is one of the most misused phrases in software engineering.

It usually means:

- it runs
- it deploys
- it works in a happy path

But in real systems, production readiness is not about functionality.

It's about behaviour under failure, change, and scale.

## The difference between working and production-ready

A system is not production-ready when:

- it can be deployed

It is production-ready when:

- it can fail safely
- it can be observed
- it can be redeployed without service interruption
- it behaves consistently under load
- it can be operated by people who did not build it

Most early-stage systems do not meet this bar.

Not because teams are careless - but because these properties are usually added after the system exists.

## The problem with "we'll add it later"

In practice, "later" becomes:

- after customers arrive
- after scale pressure begins
- after incidents expose gaps
- after engineering velocity slows

At that point, the system is no longer neutral.

It has opinions:

about structure

about deployment

about observability

about service boundaries

And those opinions are expensive to change.

## Where teams actually spend their time

Across multiple environments I've worked in - from startups to large AWS-based enterprise systems - a consistent pattern appears:

Engineering effort splits into two categories:

- domain / product requirements and features
- engineering foundation and operational work

In many early systems, the work that goes into engineering foundations - such as deployments, versioning, build and test standards and optimisations, pipelines etc. - becomes a dominant and usually hidden cost.

At one startup, my estimate was that "technical" stories accounted for the majority of backlog creation over time, eclipsing feature development.

This is not an edge case.

This is how systems evolve.

## Why this is so hard to avoid

Most teams don't consciously choose to neglect operational maturity.

The problem is that product work is always visible, while engineering foundations are largely invisible.

A new feature can be demonstrated to customers, investors, and stakeholders. It can be tied directly to revenue, growth, or market validation. Improvements to deployment pipelines, observability, security controls, or operational tooling rarely have that luxury. Their value is indirect, preventative, and often only becomes obvious when something goes wrong.

As a result, engineering teams are under constant pressure to prioritise business-driven outcomes over engineering excellence. Every sprint presents another feature request, customer commitment, sales opportunity, or roadmap deadline competing for attention.

Over time, small compromises accumulate:

- Deployment processes remain partially manual because "we'll automate it later."
- Monitoring exists, but not at the depth needed to diagnose production issues quickly.
- Security controls are good enough for today's customers, but not tomorrow's.
- Operational knowledge lives in people's heads rather than in systems and documentation.

None of these decisions are unreasonable in isolation. In fact, most are rational responses to commercial pressure.

The challenge is that operational maturity compounds in exactly the same way technical debt does. The cost of postponing it is often hidden until growth, scale, compliance requirements, or a production incident suddenly expose the gap.

By that point, fixing the foundations is competing with an even larger backlog, a larger customer base, and a business that has become increasingly dependent on systems that were never designed for the level of demand being placed on them.

## The real definition of production-ready

A more accurate definition is:

> A system is production-ready when its operational properties are designed, not discovered.

That includes:

- observability as a first-class concern
- consistent service structure and bounded contexts
- predictable deployment behaviour
- explicit failure handling patterns
- security and access boundaries defined early

## The uncomfortable truth

Most teams don't lack capability.

They lack a reusable starting point.

So they rebuild production-readiness repeatedly, instead of inheriting it once.

## The shift that matters

The real architectural question is not:

> "How do we make this production-ready?"

It is:

> "Why are we rebuilding production readiness every time?"

This is the problem space I've been focused on with Backbone: creating a reusable foundation so teams don't rediscover production-readiness under pressure.
