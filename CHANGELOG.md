# Changelog

## MVP v1.0.2 — Market Intelligence

### Added

- Added a lightweight **Institutional Market Watch** section on the dashboard.
- Added `data/market-intelligence.json` for third-party market intelligence links with 30-day retention and a 100-item cap.
- Added `data/market-sources.registry.json` for RSS-based third-party monitoring sources.
- Added `data/market-manual-sources.json` for manual curated sources such as Ledger Insights, Reuters, Bloomberg, Financial Times, Risk.net and The Paypers.
- Added `scripts/fetch-market-intelligence.mjs` to collect titles and links only; no article summaries, excerpts or copied article text are stored.
- Added `.github/workflows/market-intelligence.yml` for hourly market intelligence checks.

### Changed

- Updated Node version in GitHub Actions workflows to Node 24.
- `assets/data.js` now includes `marketIntelligence` and `marketManualSources`.
- Coverage sources now include the market intelligence source lane.

### Policy

- Market Intelligence is a supporting context lane, not the primary regulatory source of truth.
- Official regulatory updates remain the main feed.
- Premium/manual sources are link-only and curated manually; no automated scraping is configured for them.

## MVP v1.0.1 — Monitoring note logic

### Changed

- Dashboard Regulatory Radar now shows the latest 3 regulatory items regardless of priority, with priority remaining visible as a badge.
- Monitoring note now uses the latest scan result instead of the old quiet-period-only logic.
- A newly added High priority published item is treated as a material regulatory update.
- Latest scan metadata now stores High / Medium / Low counts plus draft pending item count.

## MVP First Release v1.0

Finalized first release candidate for the Digital Assets Regulatory Watch project.

### Added

- RSS-first monitoring architecture.
- `data/sources.registry.json` with publication mode per source.
- `scripts/fetch-feeds.mjs` for feed collection, relevance filtering and deduplication.
- `scripts/classify-item.mjs` for keyword-based topic, priority and category classification.
- `scripts/build-data.mjs` for generating `assets/data.js` from JSON data files.
- `scripts/update-site-url.mjs` for replacing placeholder canonical/sitemap/manifest URLs.
- GitHub Actions workflow for daily monitoring target at 07:30 Europe/London.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, Open Graph metadata and JSON-LD.
- Social preview image and app icons.
- Separate JSON data files for updates, consultations, sources, access matrix, monthly reviews and pending items.

### Confirmed decisions

- Hybrid publication model: Tier 1 official sources auto-publish; Tier 2/Tier 3 sources go to draft.
- Daily source check target: 07:30 London time.
- Scope: UK, EU, US and global standard setters.
- No scraping in MVP v1.0.
- Historical feed: selected regulatory milestones only.
- Access Matrix: selected UK, EU and US scenarios only.
- Positioning: informational regulatory intelligence workspace, not a trading or crypto-market application.

### Notes

Earlier v1.1–v1.7 packages were development builds. This package is the first release candidate labelled as `MVP First Release v1.0`.
