---
title: "We've Spent 25 Years Shifting Left. The Next Shift Is Down."
slug: twenty-five-years-of-shifting-left
summary: "For 25 years we've shifted engineering work left: CI, CD, DevOps, DevSecOps and now AI. But we've never stopped rebuilding the same operational foundations. The next shift isn't left. It's down."
description: "Continuous integration, continuous deployment, DevOps, DevSecOps and AI all made software delivery faster by moving work earlier. But they didn't eliminate the need to repeatedly build the same operational foundation. Backbone takes a different approach: move those concerns beneath your product into a shared platform."
published: 2026-07-24
updated: 2026-07-24
author: Andrew Eells
tags: [devops, software-engineering, ci-cd, ai, platform]
---

I've been building software professionally for about 25 years.

Looking back, I realised that a surprising amount of that time has been spent doing one thing.

Shifting left.

Moving work earlier. Catching problems sooner. Automating the things we used to do by hand at the end of a project.

It's been one of the defining trends of modern software engineering.

But recently I've started wondering whether we've been optimising along the wrong axis.

## Twenty-five years of shifting left

Around the turn of the millennium, continuously building and testing software instead of integrating everything just before release was still a relatively new idea.

Continuous integration emerged. CruiseControl popularised the approach, Hudson followed a few years later, and eventually Jenkins became the tool many teams knew best. "Does it build?" became a question answered automatically on every commit.

That was shift-left number one.

Testing and integration moved earlier.

Then continuous integration became continuous **delivery**. Martin Fowler and Jez Humble helped turn the idea into mainstream engineering practice. Building software wasn't enough; every commit produced something releasable.

Then the "D" quietly changed meaning.

Delivery became **deployment**.

Releasing software stopped being a scheduled event and became something that happened continuously as a consequence of merging code.

Then came DevOps.

Operations moved left too. Infrastructure, monitoring, deployments and incident response all became part of the same team's responsibility.

"You build it, you run it."

Then security took its turn. [DevSecOps](https://medium.com/slalom-build/devsecops-in-effect-at-the-web-application-firewall-472481688f8d) pushed security left as well - threat modelling, dependency scanning and policy checks moving out of a late-stage gate and into the pipeline itself.

Every few years another discipline moved closer to the developer.

Testing.

Delivery.

Deployment.

Operations.

Security.

It genuinely made us better engineers.

## AI isn't really shifting left

Today it's fashionable to put AI into the same story.

I'm not convinced that's what's happening.

AI isn't primarily moving work earlier.

It's helping us perform the same work faster.

That's an important distinction.

Where AI has changed things is by lowering the barrier to entry. Someone with relatively little operational experience can now generate a CI pipeline, Terraform configuration or deployment workflow in minutes.

Useful?

Absolutely.

But if AI's biggest contribution is helping us recreate the same infrastructure more quickly, then perhaps recreating it was never the thing we should have been doing in the first place.

## The pattern I couldn't ignore

Here's what those 25 years actually looked like.

I built CI pipelines.

Then I built them again somewhere else.

Then again.

I created infrastructure-as-code.

Then recreated it for the next company.

I wired up authentication.

Observability.

Deployment pipelines.

Audit logging.

Secrets management.

Monitoring.

Rollback procedures.

Different organisations.

Different technology stacks.

Different decades.

Almost exactly the same engineering disciplines.

None of that work was the product.

None of it differentiated the business.

It was simply the operational foundation required before the product could exist.

> These aren't product problems. They're engineering fundamentals. Yet almost every team rebuilds them from scratch, every single time.

Shift-left made us do this work earlier.

It never asked why we were repeating it at all.

Every startup, every consultancy and every enterprise greenfield project still begins by rebuilding the same engineering capabilities before a single customer problem gets solved.

## Backbone is about shifting down

That's the shift I'm interested in now.

Not left.

Down.

Imagine rotating the software lifecycle ninety degrees.

Across the top sits your product: the services, APIs and user experience your customers actually pay for.

Underneath sits everything every serious SaaS product inevitably needs.

Authentication.

Identity.

CI/CD.

Observability.

Audit.

Notifications.

Document services.

Infrastructure.

Operational tooling.

These capabilities aren't unique to your business.

They're shared engineering concerns.

So why are they still treated as project work?

**Shifting down means moving those undifferentiated engineering disciplines beneath your application into a reusable operational foundation instead of rebuilding them inside every new product.**

That's what Backbone is.

Not another framework.

Not another starter template.

An opinionated operational foundation for modern SaaS products.

Authentication, users, audit, notifications, documents and a BFF orchestration layer. Infrastructure-as-code. CI/CD. Observability. Security. Everything deployed into your own AWS account, from your own GitHub repositories, remaining entirely under your control.

The disciplines I spent decades shifting left don't disappear.

They simply stop living inside every application.

## Left was never the destination

Shift-left was absolutely the right idea.

Finding problems earlier has transformed our industry.

But somewhere along the way we confused the mechanism with the objective.

The objective was never simply to push more responsibility onto developers.

It was to stop repeatedly paying for the same engineering work in every company, on every project, for every new product.

Some engineering problems only need solving once.

The operational foundation beneath your SaaS product is one of them.

After 25 years of shifting left, that feels like the direction we've really been heading all along.

If that resonates, I'd genuinely like to hear from you - you can find out more at [backbonehq.io](https://backbonehq.io/).
