---
title: "Vibe Coding Is Reckless.\nDefined Architecture Patterns Fix It."
slug: vibe-coding-is-reckless-defined-architecture-patterns-fix-it
summary: "Vibe coding fails in the enterprise not because agents are careless, but because blank-canvas codebases force them to invent the architectural 'ilities' - scalability, security, maintainability - from scratch. Defined architecture patterns fix that."
description: "Most people calling vibe coding the future have never sat through a 2 a.m. production incident. The fix isn't better prompts - it's architecture agents can extend instead of invent."
published: 2026-08-09
updated: 2026-08-09
author: Andrew Eells
tags: [ai, architecture, software-engineering, devops]
---

Andreas Horn leads AIOps work at BLP - real enterprise IT. A while back he [posted something](https://www.linkedin.com/posts/andreashorn1_unpopular-opinion-most-of-the-people-confidently-activity-7471821090412138496-QfVi) that stuck with me: most people calling vibe coding the future have never sat through a 2 a.m. call after a misconfigured permission policy or firewall rule took production down.

<div class="blog-split">
<div class="blog-split-copy">

Demos look great. Small projects hold up. None of it survives a real enterprise, where system complexity and constraints are the default.

He's right. He's also spent a decade watching AI initiatives succeed or fail inside real companies.

Here's the sharper point: this isn't a talent problem, and it isn't a caution problem. It's a constraint problem. The [architectural "-ilities"](https://en.wikipedia.org/wiki/List_of_system_quality_attributes) - scalability, security, maintainability, observability, and the rest - are exactly the properties teams reinvent under deadline when no convention exists.

</div>
<figure class="blog-split-media">
<a class="blog-split-media-link glightbox" href="/assets/images/blog/andreas-horn-vibe-coding.jpeg">
<img src="/assets/images/blog/andreas-horn-vibe-coding.jpeg" alt="LinkedIn post graphic by Andreas Horn arguing that vibe coding fails in real enterprise IT" width="800" height="1200" loading="lazy" />
</a>
</figure>
</div>

[The twelve-factor app](https://12factor.net/) made this same bet well over a decade ago: a fixed convention for how a SaaS app runs in production, not something every team invents from scratch. That bet gets sharper once the thing touching your system is an agent, not a person.

## Why vibe coding breaks

A coding agent doesn't reason about your architecture. It reads what's there and extends it. Give it a codebase where the -ilities are already expressed the same way a dozen times, and it follows those patterns reliably. Give it a blank project - which is what vibe coding usually means - and it has nothing to follow. It invents the patterns instead: how identity is checked, what gets logged, how failures propagate, where rate limits live. The result might be plausible. It is not always production-grade.

That gap shows up in public. [WIRED reported](https://www.wired.com/story/thousands-of-vibe-coded-apps-expose-corporate-and-personal-data-on-the-open-web/) research from Red Access finding thousands of publicly accessible vibe-coded apps with effectively no authentication - and close to two thousand appearing to leak sensitive data. Security is only one -ility. The same blank-canvas pressure applies to scalability, observability, deployability, and maintainability. Agents optimise for something that works. The cross-cutting properties are what they have to guess.

## Why Backbone fixes it

Two agents, same task: add a feature that touches identity, authorization, and an audit trail - the kind of change that forces several -ilities into play at once.

On a blank project, the agent invents those concerns as it goes: where identity lives, how authorization is checked, what gets audited, how operational boundaries are drawn. Decisions about the architecture happen while the feature is being written.

On Backbone, those decisions already exist. Authentication is wired to Cognito and OAuth2. Authorization runs through an existing identity model. Audit events already have a schema, cross-cutting wiring, and a destination. Deployment, configuration, health checks, observability, and rate limiting are already established. The agent isn't designing the -ilities. It's adhering to them - extending a system with known scalability, reliability, and security characteristics rather than inventing those characteristics feature by feature.

That's the bet behind Backbone: agents are better at extending an established pattern than inventing production architecture from scratch. Service-to-service calls use explicit AWS IAM identities and policies, not credentials embedded in application code - one more decision that's already made, not one your agent has to guess at.

<aside class="blog-inline-cta prose-cta-box rounded-xl border border-[#939DB8]/10 bg-[#0F101A]" aria-label="Architecture Decision Records">
<p class="blog-inline-cta-title">Architecture Decision Records</p>
<p class="blog-inline-cta-body">Published ADRs capture the constraints behind those patterns - why Cognito, why IAM for service auth, why the observability stack looks the way it does. Not marketing. The trade-offs.</p>
<p class="blog-inline-cta-actions"><a class="blog-inline-cta-button" href="https://docs.backbonehq.io/docs/adrs" target="_blank" rel="noopener noreferrer">Read the ADRs</a></p>
</aside>

## Where this stops working

Convention only helps if it's right. A flawed pattern gets propagated faster and more confidently by an agent than by a human - it doesn't second-guess precedent, it follows it. That's an argument for getting the pattern right once, by people who've made the mistakes already, not for skipping review. An agent can follow a correct pattern into a situation it was never built for, and catching that is still your job.

One more thing: "vibe coding" might not be the word anyone's using in two years. The shift underneath it - agents doing more of the typing, over bigger diffs, with less supervision - isn't going anywhere.

## Architecture engineering, not prompt engineering

The real distinction isn't whether AI wrote the code. It's whether the agent was working inside architecture that already solved the -ilities - identity, authorization, auditing, observability, configuration, deployment - or making those calls up as it went.

If those decisions don't exist, the agent invents them while it builds your feature. If they do exist, it reinforces them.

As coding agents become capable of producing larger and larger changesets, that's the bet that matters: not prompt engineering, but architecture engineering.
