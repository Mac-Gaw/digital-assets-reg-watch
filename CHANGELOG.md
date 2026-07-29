## v1.0.23 final stable
- Stabilised the service on the MVP v1.0.15 frontend baseline.
- Added Events & Briefings beside Institutional Market Watch with four-event dashboard preview and full `#events` archive.
- Seeded `data/events.json` with manually curated institutional digital assets / tokenisation / digital money events.
- Preserved the balanced dashboard spacing and Market Intelligence / Events column layout.
- Added 3D transparent-background header icons for light and dark themes.
- Added the agreed narrow scope for Regulatory Feed, Regulatory Radar and Institutional Market Watch: digital assets, tokenisation, digital money, digital cash, tokenised deposits, stablecoins, CBDC, DLT, custody, tokenised collateral and adjacent settlement/collateral/securities-lending items only when they have a real digital/FMI angle.
- Added metadata-first scoring for feed filters: RSS keywords/categories first, title second, summary/description as a weaker fallback.
- Added false-positive exclusions for macro/FX/inflation papers, retail banking/payment outage items, and generic appointment/taskforce updates.
- Updated Regulatory Monitor workflow to run around 08:xx Europe/London across BST/GMT.
- Kept event workflow on the auto-commit pattern.

## v1.0.15-events
- Restored the MVP v1.0.23 baseline and added the Events & Briefings dashboard panel.
- Added an Events & Briefings archive route at `#events`.
- Added curated upcoming events to `data/events.json`.
- Added event source registry, event fetch script and Events & Briefings GitHub workflow.
- Updated the static data build to include `events` and `eventSources` in `assets/data.js`.

## v1.0.15
- Added separate light and dark header icon variants and theme-based switching for the brand mark.

## v1.0.14
- Tightened icon crops and added explicit PNG/ICO favicon links to reduce white corners / border effects.
- Forced Editorial Summary date text to white in both light and dark themes for readability.

## v1.0.13
- Replaced the hardcoded DA header mark with the generated icon asset.
- Added light and dark vertical editorial summary background images.
- Applied theme-aware background art to the Monthly Review / Editorial Summary date panel.

## v1.0.12
- Added future-date protection to Market Intelligence ingestion to prevent event/webinar dates being treated as article publication dates.
- Market Intelligence retention now removes future-dated retained items when the next scan runs.

## v1.0.11
- Reworked the top dashboard copy from generic workspace wording to clearer Regulatory Coverage / Digital Assets Regulatory Intelligence positioning.

## v1.0.10
- Reworked Regulatory Pulse into a true 2-in-1 summary: 30-day activity level plus latest scan result in the same description.
- Latest scan note now explicitly states how many items were added, or that no new published items were found.

## v1.0.9
- Changed Regulatory Pulse styling so only the status text is colour-coded; the card background remains neutral.
- Merged Monitoring Note into the Regulatory Pulse summary instead of displaying it as a separate panel.

## v1.0.8
- Removed non-interactive workspace category chips from the dashboard command center.
- Restored colour-coded Regulatory Pulse states in the compact command center layout.

## v1.0.7
- Combined Workspace, Monitoring, Regulatory Pulse and Monitoring Note into one compact dashboard command center.
- Reduced Monitoring Note visual footprint while keeping status visibility.

## v1.0.6
- Combined Monitoring and Last Scan into a single dashboard metric to reduce wasted space in the monitoring overview.

## v1.0.6
- Simplified the Market Intelligence dashboard archive link to “Last 30 days”.
- Made the Market Intelligence archive view more compact while keeping each link visually separated.

## v1.0.4
- Simplified the Market Intelligence dashboard archive link to a single “Archive: last 30 days” link.

## v1.0.3
- Restyled Monitoring Note alert states to better match the workspace visual system.
- Removed collection-mode badges from Market Intelligence items.
- Added a dedicated 30-day Market Intelligence archive view and visible archive link from the dashboard.

# Changelog

## MVP v1.0.3 — Market Intelligence

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
