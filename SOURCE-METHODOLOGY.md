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


## Events & Briefings methodology

Events are tracked separately from regulatory updates and market intelligence. The events panel is intended for webinars, conferences, roundtables and briefings relevant to institutional digital assets, tokenisation, stablecoins, custody, collateral and financial market infrastructure.

The initial dataset is manually curated from public event pages. The automated event workflow may append RSS-derived matches where eligible sources publish dated events.


## Final stable v1.0.23 filtering model

Regulatory Feed, Regulatory Radar and Institutional Market Watch use a narrow thematic scope. Broad terms such as settlement, collateral, custody, payments, market infrastructure, post-trade, securities lending, FCA, BoE, SEC or BIS are context only. They do not qualify an item unless a hard digital-assets anchor is present.

Hard anchors include digital assets, cryptoassets, tokenisation/tokenization, tokenised assets/securities, stablecoins, digital money, digital cash, tokenised/tokenized deposits, deposit tokens, bank-issued tokens, commercial bank money tokens, CBDC, digital settlement assets, DLT, digital asset custody and tokenised collateral.

The scoring model weights RSS keywords/categories most heavily, then title, then summary/description. General macroeconomic research, FX/inflation papers, retail banking/payment outages and generic appointment/taskforce updates are excluded unless a strong digital-assets anchor is present.
