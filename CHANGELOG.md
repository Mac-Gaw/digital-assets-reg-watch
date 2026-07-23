# Changelog

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
