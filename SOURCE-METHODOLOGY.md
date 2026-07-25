# Source Methodology

## Purpose

Digital Assets Regulatory Watch is designed as an informational regulatory intelligence workspace. The source model prioritises public, official and institutional materials relevant to digital assets, tokenisation, stablecoins, cryptoasset regulation, institutional permissions and financial market infrastructure.

## Source hierarchy

### Tier 1 — primary / official sources

Used as the highest-confidence layer. These sources may be auto-published when the relevance filter matches.

Examples:

- Financial Conduct Authority
- Bank of England
- HM Treasury
- ESMA
- EBA
- EUR-Lex
- SEC
- CFTC
- OCC
- Federal Reserve
- FDIC
- Federal Register
- U.S. Treasury
- BIS
- Basel Committee
- IOSCO
- FSB

### Tier 2 — legal and institutional analysis

Used as secondary context. These are collected as drafts by default.

Examples:

- Ledger Insights
- Finextra
- Latham & Watkins tracker
- Norton Rose Fulbright Regulation Tomorrow

### Tier 3 — academic and research sources

Used selectively for background, taxonomy and research context. Not a substitute for primary regulatory sources.

## Auto-publication policy

A new item is auto-published only when:

1. it comes from an enabled Tier 1 source configured with `publishMode: "auto"`, and
2. the title or description matches the regulatory relevance keyword set.

Tier 2 and Tier 3 items are written to `data/pending-items.json` for manual review.

## No scraping policy

MVP v1.0 does not scrape pages. It supports RSS/Atom feeds and keeps page-watch/manual sources in the registry for transparency. Page-watch sources can be reviewed manually or upgraded later if a compliant feed/API becomes available.

## Classification model

The MVP uses transparent keyword classification. Each item may receive:

- jurisdiction,
- source type,
- content type,
- priority,
- topic tags,
- summary,
- why-it-matters note.

This is intentionally simple and auditable. It should not be treated as legal advice or definitive regulatory classification.

## Historical baseline

The feed includes a curated baseline of selected regulatory milestones. It is not intended to be a complete archive of all historic digital-asset publications.

## Regulatory Access Matrix

The Access Matrix covers selected UK, EU and US institutional scenarios. Missing combinations do not mean that an activity is permitted or prohibited. They only mean that the MVP matrix does not yet contain that scenario.

## Market Intelligence lane — v1.0.2

The Market Intelligence lane is intentionally separate from the official regulatory feed. It is designed to provide institutional context only: tokenisation, custody, stablecoins as payment or settlement infrastructure, FMI, clearing, settlement, collateral, securities services and regulated market infrastructure.

Market intelligence records store only:

- article title;
- source name;
- publication date;
- outbound URL;
- high-level category;
- collection mode.

The site does not store third-party article summaries, excerpts or article body text in this lane.

Auto-monitored sources are RSS-first. Manual-only sources such as Reuters, Bloomberg, Financial Times, Ledger Insights and other premium or rights-sensitive publishers should be added only as curated links when appropriate, not scraped.

Default retention is 30 days, capped at 100 retained items unless changed through environment variables.
