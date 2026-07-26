---
title: "The software nobody plans to build - but every successful team eventually does..."
slug: the-software-nobody-plans-to-build
summary: "Every software company starts with one product. Given enough time, almost every successful team ends up building a second one they never planned for."
description: "Every successful engineering team eventually builds a second product they never planned for: their engineering foundations. Here's why - and what to do about it."
published: 2026-06-26
updated: 2026-06-26
author: Andrew Eells
tags: [saas, aws, software-engineering]
canonicalSource: "https://dev.to/aeells/the-software-nobody-plans-to-build-but-every-successful-team-eventually-does-1pbf"
---

Every software company starts with one product.

The product customers buy.

The product investors care about.

The product the roadmap revolves around.

But given enough time, almost every successful engineering team finds itself building something else.

Not because they planned to.

Because they have to.

## The second product

It doesn't have a marketing website.

Customers never ask for it by name.

Nobody demos it to investors.

Yet it quietly grows alongside the business.

It's your engineering foundations.

The authentication services.

The deployment pipelines.

The infrastructure.

The observability stack.

The audit logging.

The notification system.

The release processes.

The operational tooling.

The architectural conventions.

Individually, none of these things are your product.

Collectively, they're what allow your product to scale.

## It happens one decision at a time

Nobody sets out to spend months building engineering foundations.

Instead, they make perfectly reasonable decisions.

"We'll automate deployments later."

"This service just needs its own authentication for now."

"We'll improve the monitoring once we've got more customers."

"We'll standardise this after the next release."

Every one of those decisions is commercially rational.

Product delivery has to come first.

But each compromise adds another piece to a second codebase that the business never intended to own.

## The hidden backlog

Earlier in my career, while CTO at a UK insurance startup, I estimated that around **60% of our engineering backlog** wasn't product work at all.

It was engineering foundations.

Improving CI/CD.

Standardising infrastructure.

Strengthening security.

Adding observability.

Operational tooling.

Developer experience.

Performance and security testing.

None of those stories generated revenue directly.

But every one of them made future product delivery faster, safer and more predictable.

Eventually we realised something important:

We weren't just building an insurance platform anymore.

We were also building the engineering foundations that made the insurance platform possible.

## The Groundhog Day problem

Over the last 20+ years I've worked across startups, consultancies and enterprise engineering teams.

Different industries.

Different products.

Different company sizes.

Yet I kept rebuilding remarkably similar engineering foundations.

Authentication.

Audit.

Notifications.

Infrastructure.

Deployment pipelines.

Observability.

Release management.

Security controls.

Developer tooling.

Different implementations.

The same problems.

After a while it started to feel like Groundhog Day.

Every organisation was independently solving problems that thousands of engineering teams had already solved before.

## Engineering foundations are inevitable

This isn't an argument against building engineering foundations.

They're essential.

Every successful software company eventually needs them.

The question is simply **when** and **how** you build them.

Do you invest months (or years) constructing them incrementally while trying to deliver product?

Or do you begin with mature engineering foundations already in place and let your team focus on the capabilities that actually differentiate your business?

That's a very different starting position.

## Final thoughts

I've come to believe that one of the biggest hidden costs in software engineering isn't technical debt.

It's repeatedly rebuilding the same engineering foundations.

Not because they're unique.

But because every organisation assumes it has to start from scratch.

That realisation is ultimately what led me to build Backbone.

After spending more than two decades repeatedly building the same operational capabilities across startups and enterprise programmes, I wanted to create something that lets engineering teams begin with mature foundations already in place - so more of their time is spent building the product they're actually in business to create.

If that resonates, you can learn more at [backbonehq.io](https://backbonehq.io/).
