---
title: "AWS Transform and Superwerker: same vocabulary, different problems"
slug: aws-transform-vs-superwerker
summary: "AWS Transform's new landing zone agent and Superwerker both stand up governed multi-account AWS environments - but they're built for different moments in a company's cloud journey. A read-from-the-docs take, plus why Backbone still points greenfield teams at Superwerker."
description: "AWS Transform's landing zone agent and Superwerker both create governed AWS environments, but they solve different problems. A practitioner's comparison - including hands-on Superwerker experience - and where Backbone fits."
published: 2026-07-11
updated: 2026-07-11
author: Andrew Eells
tags: [aws, platform-engineering, devops, startup, migration]
---

Most people will read [AWS Transform's landing zone agent](https://aws.amazon.com/blogs/migration-and-modernization/automate-your-landing-zone-creation-with-aws-transform/) as Superwerker's smarter cousin. I don't think that's right.

Same destination. Different problems. Treating them as substitutes is how greenfield teams buy enterprise process they don't need - and how migration teams under-buy governance they do.

I saw the announcement via a LinkedIn post, and it stuck because the vocabulary overlaps heavily with a tool I've actually used and rate highly: [Superwerker](https://github.com/superwerker/superwerker). I haven't run Transform myself - this is a read from the announcement and docs, not a hands-on review. I'd genuinely like to hear from anyone who has.

## Superwerker: opinionated defaults, shipped

Superwerker is a free, MIT-licensed CloudFormation stack. You run it, and it stands up a multi-account baseline - Control Tower, SSO, and sensible guardrails - without a discovery workshop. We used it on a recent greenfield build and had SSO and baseline guardrails live in an afternoon. The entire decision tree is a public repo you can read end to end before you commit to anything.

I'm generally a fan of opinionated tooling. If there is a sensible default, I'd rather spend engineering time building product than debating OU structures.

If I were founding again tomorrow with a blank AWS org, I'd run Superwerker before I spent a day on account design. Greenfield teams don't fail because their landing zone wasn't migration-aware. They fail because they never got a baseline and spent months refactoring after the event.

## Transform: a different problem

Transform's agent is a different shape of tool entirely. It's not a standalone landing zone builder - it's embedded in AWS Transform's end-to-end migration workflow. Transform gathers information about your organisation, migration waves, compliance requirements and account structure before proposing a landing zone.

That's a fundamentally different problem from "deploy me a sensible default."

## Where Backbone sits

[Backbone](https://backbonehq.io/) deliberately stops at the landing zone boundary. That's infrastructure governance, and every organisation has different requirements. Once that foundation exists - whether it came from Superwerker, AWS Transform or something else - that's where Backbone starts.

## A working rule of thumb

- **Greenfield startup?** Use Superwerker.
- **Enterprise migration?** Look seriously at AWS Transform.
- **Brownfield AWS estate?** Use judgement. Every organisation carries different history and constraints.

I haven't used Transform yet, so I'd genuinely like to hear from teams that have. I'm much more interested in where this rule breaks down than where it holds.
