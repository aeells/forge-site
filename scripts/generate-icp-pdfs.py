#!/usr/bin/env python3
"""Generate Forge ICP PDFs for the founding partners program.

Requires: pip install reportlab

Usage:
  python3 scripts/generate-icp-pdfs.py
"""

from __future__ import annotations

import os
import sys

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import Paragraph, SimpleDocTemplate
except ImportError:
    print("Missing dependency: reportlab", file=sys.stderr)
    print("Install with: python3 -m pip install reportlab", file=sys.stderr)
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(ROOT, "public", "assets", "documents")

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "Title",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=16,
    leading=20,
    spaceAfter=10,
)
heading_style = ParagraphStyle(
    "Heading",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=14,
    spaceBefore=12,
    spaceAfter=5,
)
body_style = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=10,
    leading=13.5,
    spaceAfter=6,
    leftIndent=0,
    firstLineIndent=0,
)
bullet_style = ParagraphStyle(
    "Bullet",
    parent=body_style,
    leftIndent=14,
    bulletIndent=0,
    spaceAfter=3,
)
hook_style = ParagraphStyle(
    "Hook",
    parent=body_style,
    fontName="Helvetica-Oblique",
    fontSize=10,
    leading=13.5,
    spaceBefore=5,
    spaceAfter=9,
    leftIndent=0,
)

Block = tuple[str, str | list[str]]


def escape_xml(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def bullet_paragraphs(items: list[str]) -> list[Paragraph]:
    return [
        Paragraph(f"<bullet>&bull;</bullet>{escape_xml(item)}", bullet_style) for item in items
    ]


def hook_paragraphs(items: list[str]) -> list[Paragraph]:
    return [Paragraph(f'"{escape_xml(item)}"', hook_style) for item in items]


def build_pdf(filename: str, blocks: list[Block]) -> None:
    path = os.path.join(OUTPUT_DIR, filename)
    doc = SimpleDocTemplate(
        path,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title=filename,
    )
    story = []
    for kind, content in blocks:
        if kind == "title":
            story.append(Paragraph(content.replace("\n", "<br/>"), title_style))
        elif kind == "heading":
            story.append(Paragraph(content, heading_style))
        elif kind == "body":
            story.append(Paragraph(content, body_style))
        elif kind == "bullets":
            story.extend(bullet_paragraphs(content))
        elif kind == "hooks":
            story.extend(hook_paragraphs(content))
    doc.build(story)
    print(f"Wrote {path}")


CORE_TECH_STACK = [
    "Java and Quarkus (JVM or GraalVM native) on AWS ECS Fargate",
    "Cognito, RDS PostgreSQL, DynamoDB, and S3",
    "Infrastructure defined in CDK; delivery via GitHub Actions",
    "Prometheus, Grafana, and OpenTelemetry",
    "Forked to the customer's GitHub org; runs in their AWS account",
]

CORE_TECH_STACK_ENTERPRISE = CORE_TECH_STACK + [
    "AWS-only today — opinionated by design",
]


EARLY_STAGE: list[Block] = [
    ("title", "Forge Platform ICP #1: Early-Stage Technical Founders"),
    ("heading", "Core hypothesis"),
    (
        "body",
        "Technical founders want to spend time on product differentiation — not rebuilding authentication, "
        "deployment pipelines, observability, cloud infrastructure, and operational tooling.",
    ),
    ("heading", "Typical characteristics"),
    (
        "bullets",
        [
            "Bootstrapped, pre-seed, seed, or recently funded",
            "Building software with meaningful operational requirements",
            "Expect security, deployment automation, observability, and cloud architecture to matter",
        ],
    ),
    ("heading", "Common examples"),
    (
        "bullets",
        [
            "B2B or AI SaaS",
            "FinTech or HealthTech",
            "Developer tools",
            "Data platforms",
            "Vertical SaaS",
            "Consumer applications with meaningful backend complexity",
            "Custom commerce platforms",
        ],
    ),
    ("heading", "Qualification questions"),
    (
        "bullets",
        [
            "Are they building a real product — not a demo, agency deliverable, or throwaway MVP?",
            "Will they need accounts, auth, deployment discipline, and observability within the next 6–12 months?",
            "Would a platform engineer month (or more) on undifferentiated infrastructure hurt their timeline or runway?",
        ],
    ),
    ("heading", "Poor fits"),
    (
        "bullets",
        [
            "Agencies or consultancies buying on behalf of clients",
            "Local businesses or simple brochureware products",
            "Marketplace MVPs with minimal backend requirements",
            "Thin AI wrappers with no meaningful platform or operational needs",
        ],
    ),
    ("heading", "Buyer titles"),
    (
        "body",
        "Founder, Co-Founder, Technical Founder, Founder &amp; CTO, CTO, Founding Engineer, Lead Engineer, Principal Engineer",
    ),
    ("heading", "Core tech stack"),
    ("bullets", CORE_TECH_STACK),
    ("heading", "Timing signals"),
    (
        "body",
        "Recent or planned hiring for backend, platform, DevOps, or infrastructure engineering often indicates "
        "the team is about to invest in foundations Forge already provides.",
    ),
    ("heading", "Primary message"),
    (
        "body",
        "Launch with enterprise-grade operational maturity from day one. Focus engineering on domain services and "
        "differentiators — not on rebuilding the platform every scaling company eventually needs.",
    ),
    ("heading", "Conversation hooks"),
    (
        "hooks",
        [
            "Most teams spend years assembling the operational stack behind a SaaS company. With Forge, a capable engineer can be deploying on a production-ready platform from day one.",
            "Shortcut your CTO or founding engineer's workload by ~50% — and keep them on product, not plumbing.",
            "The entire operational stack behind a modern SaaS company — without hiring a platform team first.",
            "Platform capability normally built by companies 10x your size — available from the start.",
            "Enterprise-grade foundations at a fraction of the cost of building them yourself.",
            "Early adopters: free founder-led deployment support.",
        ],
    ),
]


ENTERPRISE: list[Block] = [
    ("title", "Forge Platform ICP #2: Enterprise Greenfield Teams"),
    ("heading", "Core hypothesis"),
    (
        "body",
        "Teams launching new products or platforms want enterprise-grade operational foundations without standing up "
        "a full internal platform engineering function first.",
    ),
    ("heading", "Typical characteristics"),
    (
        "bullets",
        [
            "New product divisions",
            "Platform initiatives",
            "Cloud-native transformation projects",
            "Innovation teams",
        ],
    ),
    ("heading", "Common goals"),
    (
        "bullets",
        [
            "Faster delivery",
            "Operational consistency",
            "Security by default",
            "Governance",
            "Reduced platform engineering effort",
        ],
    ),
    ("heading", "Industries"),
    (
        "body",
        "Financial services, insurance, healthcare technology, enterprise software, telecommunications, "
        "government technology, utilities.",
    ),
    ("heading", "Qualification questions"),
    (
        "bullets",
        [
            "Is this a net-new product or platform — not a lift-and-shift of a legacy monolith?",
            "Does leadership want standardized architecture without a multi-year internal platform build?",
            "Is AWS an acceptable deployment target for the initiative?",
        ],
    ),
    ("heading", "Trigger events"),
    (
        "bullets",
        [
            "New platform or product initiative approved",
            "New CTO or engineering leadership with a delivery mandate",
            "Cloud migration or modernization program underway",
            "Acquisition requiring engineering standardization",
            "Multiple platform, SRE, or cloud engineering hires",
        ],
    ),
    ("heading", "Buyer titles"),
    (
        "body",
        "Director of Engineering, VP Engineering, Head of Platform Engineering, Head of Software Engineering, "
        "Principal Architect, Enterprise Architect, Staff Engineer, Platform Architect, Cloud Architect",
    ),
    ("heading", "Core tech stack"),
    ("bullets", CORE_TECH_STACK_ENTERPRISE),
    ("heading", "Primary message"),
    (
        "body",
        "Standardized enterprise-grade architecture with security, governance, operational consistency, and automated "
        "delivery — available immediately rather than built internally over several years.",
    ),
    ("heading", "Conversation hooks"),
    (
        "hooks",
        [
            "Give a greenfield team the internal platform capability normally built by companies 10x their size — without standing up a platform engineering function.",
            "The entire operational stack behind a modern SaaS company — with security, governance, and operational consistency built in.",
            "Standardized architecture now, not a multi-year internal platform build.",
            "Most teams spend years assembling this. Forge puts a production-ready foundation in place from day one.",
            "Production-grade platform foundations at a fraction of the cost of building them internally.",
            "Founder-led deployment support — hands-on help through onboarding and first production deploy.",
        ],
    ),
]


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    build_pdf("Forge_ICP_Early_Stage_Technical_Founders.pdf", EARLY_STAGE)
    build_pdf("Forge_ICP_Enterprise_Greenfield_Teams.pdf", ENTERPRISE)


if __name__ == "__main__":
    main()
