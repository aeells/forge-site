---
title: "The CDK diagram generators were right - and not publishable"
slug: how-ai-finally-solved-aws-architecture-diagrams
summary: "CloudFormation graphs answer a different question than architecture diagrams. A hybrid workflow - Cursor analysing CDK intent, a curated YAML model, and Kiro CLI rendering via MCP - produced the first AWS diagram I'd actually publish."
description: "Why CDK auto-diagram tools faithfully render infrastructure you would never show a customer, and how a hybrid AI workflow (Cursor + Kiro CLI + AWS Diagram MCP) finally made architecture diagrams maintainable."
published: 2026-07-09
updated: 2026-07-09
author: Andrew Eells
tags: [aws, cdk, architecture, ai, platform-engineering, devops]
---

After years of fighting draw.io, CloudFormation graphs and auto-generated spaghetti, I finally found a workflow that generates AWS architecture diagrams I'd actually publish.

I've been building software professionally for over 25 years.

I have yet to be genuinely excited by AI's impact on large-scale software engineering. It's exceptionally good at bounded problems - a Bash script, a utility class, an isolated feature - and it's undeniably accelerating delivery. But building an entire production platform is a different challenge. That's still about architecture, trade-offs, operational thinking and years of accumulated engineering judgement.

I don't believe "vibe coding" is replacing experienced engineers any time soon. AI is an extraordinary force multiplier, but it doesn't replace engineering judgement. If you're only capable of building poor software today, AI mostly helps you build poor software faster.

But this...

This genuinely felt like the first time AI solved *this category of* problem I'd been wrestling with for years.

In under two hours I went from this...

"A salesperson asked if I had an architecture diagram. I said, 'Yes... but it's rubbish.'"

...to publishing this.

![Forge Platform AWS architecture diagram showing CloudFront edge delivery, VPC public and private subnet boundaries, ECS Fargate microservices, RDS PostgreSQL, ElastiCache Redis, Cognito identity, and observability services](https://raw.githubusercontent.com/get-forge/forge-docs/v1.0/assets/forge-architecture.png)

You can see the [live diagram on the Forge docs site](https://docs.forgeplatform.software/docs/welcome#architecture-and-runtime-model), with more detail in the [AWS platform infrastructure guide](https://docs.forgeplatform.software/docs/infrastructure).

After literally **years** of trying different approaches, this is the first workflow that has produced an architecture diagram I'd happily put in front of customers.

## The problem with architecture diagrams

Anyone building on [AWS](https://aws.amazon.com/) has probably been here.

The architecture changes.

The diagram doesn't.

Eventually someone opens draw.io and spends half a day dragging icons around.

Six months later it's wrong again.

I've spent years trying to solve this problem.

### Manual diagrams

I've built diagrams using tools including:

- [draw.io AWS diagram shapes](https://www.drawio.com/docs/diagram-types/aws-diagrams/)
- [Lucidchart](https://www.lucidchart.com/)
- [Microsoft Visio](https://www.microsoft.com/en-us/microsoft-365/visio/flowchart-software)
- [Cloudcraft](https://www.cloudcraft.co/) (live AWS/Azure scanning and visual designer)
- [Eraser AI AWS Diagram Generator](https://www.eraser.io/ai/aws-diagram-generator) (prompt-to-diagram)

The results can look fantastic - whether you drew them by hand, scanned live infrastructure, or generated them from a written description.

Until the infrastructure changes.

Then they immediately start drifting from reality.

### CDK diagram generators

I also explored tools including:

- [cdk-dia](https://github.com/pistazie/cdk-dia)
- [cdk2d2](https://github.com/duartealexf/cdk2d2)
- [AWS PDK CDK Graph](https://aws.github.io/aws-pdk/developer_guides/cdk-graph/index.html) (with its [diagram plugin](https://aws.github.io/aws-pdk/developer_guides/cdk-graph-plugin-diagram/index.html))

These are clever projects.

They faithfully represent your infrastructure.

Unfortunately, for *customer-facing architecture communication*, that's exactly the problem.

A single ECS service explodes into something like:

- Task Definition
- Execution Role
- Task Role
- Security Groups
- Target Groups
- Listener Rules
- Auto Scaling
- CloudWatch Alarms
- Log Groups
- IAM Policies
- ENIs

Everything is technically correct.

Nothing is architecturally useful.

[CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) graphs answer:

> **"What AWS resources exist?"**

Architects are usually trying to answer:

> **"How does this system work?"**

Those are completely different questions.

The CDK diagram generators were right. They just weren't publishable.

### AWS Workload Discovery

I even evaluated AWS' own solution:

[AWS Workload Discovery on AWS](https://docs.aws.amazon.com/solutions/latest/workload-discovery-on-aws/solution-overview.html)

It discovers infrastructure.

It inventories resources.

It builds dependency graphs.

For me?

It simply wasn't worth the cost - **over $400/month** just to deploy the CloudFormation stack and keep the discovery pipeline running, so you can draw a diagram of what you already deployed with CloudFormation. That is a genuinely terrible proposal for a documentation problem.

Again, it documents what AWS has deployed.

It doesn't communicate your architecture.

## The breakthrough

The breakthrough came from this AWS blog:

[Build AWS architecture diagrams using Kiro CLI and MCP](https://aws.amazon.com/blogs/machine-learning/build-aws-architecture-diagrams-using-amazon-q-cli-and-mcp/)

*(The URL still references Amazon Q; the post was reviewed and updated for [Kiro CLI](https://kiro.dev/docs/cli/chat/security/) in December 2025.)*

At first I thought:

> "Interesting... but they're just feeding text into an LLM."

Then I realised something.

**That isn't a weakness. It's the entire point.**

An experienced solutions architect doesn't think in CloudFormation resources.

They mentally ignore:

- IAM Roles
- Security Groups
- Parameters
- Log Groups
- Listener Rules
- Auto Scaling Targets

and instead think:

- Application Load Balancer
- ECS Services
- PostgreSQL
- Redis
- S3
- Cognito

That's architecture.

Not implementation.

The LLM wasn't trying to replace an architect.

It was acting as an **architectural abstraction layer** - the same idea as a [C4 container diagram](https://c4model.com/): document intent at the level stakeholders actually care about.

That was the lightbulb moment.

## Cursor did almost all of the work

Armed with that idea, I pointed [Cursor](https://cursor.com/) at my [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) repository.

I also gave it some context from a conversation I'd had with ChatGPT about why CloudFormation graphs are the wrong level of abstraction - useful for framing, but Cursor did the actual work.

Then I basically let it loose.

It analysed the repository.

It walked the stacks.

It understood the constructs.

It traced the networking.

It identified which AWS resources represented meaningful architectural components and which were simply implementation plumbing.

Then it produced:

- a curated architecture model
- rendering instructions
- a repeatable workflow
- automation scripts
- documentation updates
- and finally, the diagram itself.

I didn't manually reverse-engineer thousands of CloudFormation resources into a diagram. I reviewed and refined what the tooling produced.

That's a huge distinction.

The AI wasn't making architectural decisions.

It was reverse engineering architectural decisions I'd already made in code.

My role was limited - mostly review, a few rounds of feedback, and sanity-checking that the subnet story matched what we'd actually built.

## That's a far harder problem than it sounds

The YAML wasn't the clever part.

The clever part was that Cursor understood:

- an ECS Task Role isn't an architectural component
- an Application Load Balancer definitely is
- six Fargate services belong together
- subnet boundaries matter
- CloudFront belongs at the edge
- PostgreSQL, Redis and Cognito deserve first-class representation

None of that existed in a single file.

It emerged from analysing thousands of lines of CDK spread across stacks, constructs and configuration - including constructs like `ForgeStaticEdgeDeliveryConstruct`, which encodes the CloudFront → S3 static UI + API path proxying story as a single architectural unit rather than a pile of distribution behaviours and origin policies.

That's genuinely impressive.

## Was it perfect first time?

No.

I iterated a couple of times.

I told Cursor to:

- collapse repeated Cognito connections and repeated metrics connections to AMP
- show public/private subnet boundaries in the VPC

The second render was immediately publishable.

There was also a small tooling wrinkle: the [AWS Diagram MCP server](https://github.com/awslabs/mcp/tree/main/src/aws-diagram-mcp-server) package has been yanked upstream, so we pinned the last published version (`1.0.23`) in a source-controlled `mcp.json`. That kind of friction is worth mentioning - this wasn't magic; we wrestled with it slightly to get it working.

## The hybrid workflow

The workflow ended up looking like this.

```text
CDK repository
        │
        ▼
Cursor analyses architectural intent
        │
        ▼
Curated intermediate model (YAML)
        │
        ▼
Kiro CLI
        │
        ▼
AWS Diagram MCP ([Model Context Protocol](https://modelcontextprotocol.io/))
        │
        ▼
Published AWS architecture diagram
        ([Python diagrams](https://diagrams.mingrammer.com/) + [Graphviz](https://graphviz.org/) + AWS icons)
```

The architecture model is version controlled.

The prompt is version controlled.

The rendering script is version controlled.

The generated diagram can be regenerated whenever the platform evolves.

For the first time ever, my architecture documentation actually feels maintainable.

## Why this works

The key insight is surprisingly simple.

**Architecture diagrams should document intent, not implementation.**

My CDK constructs already encode that intent.

They have names like:

- `ForgeStaticEdgeDeliveryConstruct`
- `ForgeEcsWorkloadConstruct`
- `ForgeCognitoIdpStack`

Those are architectural concepts.

CloudFormation is an implementation detail.

Trying to diagram CloudFormation is a bit like trying to explain a car by drawing every nut and bolt.

Sometimes abstraction is exactly what you want.

## AI finally solved the right problem

This experience genuinely changed my opinion of where AI delivers value.

Not by replacing engineers.

Not by generating production systems from prompts.

Not by writing thousands of lines of code you'll spend next week debugging.

Instead, it behaved like a very competent technical collaborator.

It absorbed an entire repository.

It reconstructed the architecture.

It understood what mattered.

It ignored what didn't.

It accepted feedback.

It refined the output.

The AI wasn't designing my platform.

But it did an excellent job of documenting a platform that already exists - the same platform I write about when debugging [AMP remote write failures](https://forgeplatform.software/blog/when-amp-returns-400-check-discarded-samples/) or explaining [what production-ready actually means](https://forgeplatform.software/blog/what-production-ready-actually-means/).

## Would I trust it blindly?

Absolutely not.

The architecture still belongs to the engineers who built the system.

The AI isn't deciding what the platform looks like.

It's modelling something that already exists.

The human remains accountable.

The AI removes an enormous amount of tedious work.

That's augmentation.

Not replacement.

## What's next?

This has me thinking the future isn't another CDK diagram generator.

It's architecture-aware tooling.

Imagine a workflow that can:

- analyse your CDK constructs
- infer architectural components
- maintain a version-controlled intermediate model
- regenerate diagrams automatically
- produce different views for developers, operations, security reviews and customer documentation

That feels considerably more exciting than another CloudFormation graph.

And I essentially have that version-controlled now - tied to a real [ECS on Fargate](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html) platform, not a toy example.

## Here's how Cursor did it

The interesting part isn't the PNG. It's the intermediate model - a curated, solutions-architect view derived from CDK constructs, not from the synthesized CloudFormation dependency graph.

The model header explains the intent:

```yaml
---
# Forge Platform - curated architecture model
#
# Derived from CDK constructs under infra/src/lib (NOT from the synthesized
# CloudFormation dependency graph). Low-level noise (IAM roles/policies,
# security groups, log groups, alarms, KMS keys, SSM params, ENIs, target
# groups, listener rules) is deliberately omitted.
#
# Source of truth mapping:
#   - Edge / CloudFront .......... forge-static-edge-delivery-construct.ts
#   - Ingress (ALBs) ............. forge-ecs-ingress-construct.ts
#   - Compute (Fargate) .......... forge-ecs-workload-construct.ts
#   ...
```

Nested groups encode the VPC security boundary:

```yaml
groups:
  - id: vpc
    label: VPC (ForgePlatformVpc)
  - id: public_subnets
    label: Public Subnets
    parent: vpc
  - id: private_subnets
    label: Private Subnets
    parent: vpc
  - id: compute
    label: ECS Fargate Cluster
    parent: private_subnets
  # ...
```

Aggregate connections collapse repeated edges - six identical "service auth" lines become one:

```yaml
  - from: compute
    to: cognito_service
    label: service auth
    aggregate: true
```

The MCP server registration is trivial - no secrets, just a pinned package launch:

```json
{
  "mcpServers": {
    "awslabsawsdiagrammcpserver": {
      "command": "uvx",
      "args": [
        "--from",
        "awslabs.aws-diagram-mcp-server==1.0.23",
        "awslabs.aws-diagram-mcp-server"
      ],
      "env": {}
    }
  }
}
```

And regeneration is a one-liner:

```bash
./infra/architecture/render-diagram.sh
```

Which syncs the MCP config, then drives Kiro non-interactively:

```bash
kiro-cli mcp import --file "${mcp_config}" --force global
kiro-cli chat --no-interactive --trust-all-tools "$(cat diagram-prompt.md)"
```

The prompt tells the MCP server how to map component types to [diagrams](https://diagrams.mingrammer.com/) nodes, nest subnet clusters, and honour aggregate edges - treating the YAML as the single source of truth.

That's the whole trick: **deterministic extraction from code you already wrote, LLM-assisted rendering for polish.**

## Final thoughts

This is probably the first AI workflow I've adopted where I immediately thought:

> **"I'm never going back."**

Not because the AI was smarter than me.

Because it could absorb an entire repository, retain all of that context, and perform a task that would have taken me several evenings of tedious work.

I've spent years looking for a workflow that made architecture diagrams feel like source code instead of PowerPoint.

This approach is by far the best I've seen.

Not because AI magically solved architecture.

Because it finally solved the tedious part.
