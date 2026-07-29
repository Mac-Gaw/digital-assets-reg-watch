# Digital Assets Regulatory Watch — MVP First Release v1.0

**Digital Assets Regulatory Watch** is an informational regulatory intelligence workspace for public-source monitoring of digital assets regulation, tokenisation, stablecoins, institutional permissions and financial market infrastructure developments.

The project is deliberately positioned as a **regulatory / informational research workspace**, not as a trading, portfolio, pricing, wallet or investment-advice product.

## What is included

- Static webapp UI with dark/light mode.
- Dashboard with compact monitoring status, last scan and regulatory pulse.
- Curated regulatory feed covering current updates and selected historical milestones.
- Consultation tracker.
- Regulatory Access Matrix for selected UK, EU and US institutional scenarios.
- Coverage & Methodology section.
- About page with boundaries and disclaimer.
- RSS-first monitoring automation.
- Source registry with Tier 1 auto-publish and Tier 2/Tier 3 draft workflow.
- GitHub Actions workflow for daily monitoring target at **07:30 Europe/London**.
- SEO / identification files: `robots.txt`, `sitemap.xml`, `site.webmanifest`, Open Graph metadata, JSON-LD and social preview image.

## Publication policy

The MVP uses a hybrid model:

- **Tier 1 official / institutional sources**: auto-publish when the relevance filter matches.
- **Tier 2 and Tier 3 sources**: collected into `data/pending-items.json` for review.
- **Scraping**: disabled in MVP v1.0.
- **RSS/Atom**: supported where available.
- **Page-watch/manual sources**: listed in the registry for transparency but not scraped in v1.0.

## Run locally

Open `index.html` directly, or run a local server:

```bash
npm run serve
```

Then open:

```text
http://localhost:8080
```

## Build data bundle

The UI reads from `assets/data.js`. This file is generated from JSON files in `data/`.

```bash
npm run build:data
```

## Run monitoring manually

```bash
npm run fetch
```

Dry run:

```bash
npm run fetch:dry-run
```

RSS-only mode:

```bash
npm run fetch:rss-only
```

## Configure your real domain

The package uses `https://example.com/` as a placeholder for canonical, Open Graph, sitemap and manifest URLs.

After choosing a domain, run:

```bash
npm run configure:url -- https://your-domain.example
```

Then rebuild/commit the generated files.

## Deploy

This project is compatible with:

- Cloudflare Pages
- GitHub Pages
- Netlify
- any static hosting provider

No backend is required for the webapp. GitHub Actions can update the static data files by committing changes back to the repository.

## Important boundaries

This workspace does **not** provide:

- investment advice,
- legal advice,
- trading signals,
- cryptoasset prices,
- wallet services,
- portfolio tracking,
- execution functionality,
- definitive regulatory-perimeter assessments.

It is a public-source research and monitoring tool.

## Market Intelligence lane

MVP v1.0.23 adds a lightweight Institutional Market Watch section. It stores third-party market intelligence as titles and outbound links only. No article summaries, excerpts or copied article text are stored.

Auto-monitoring is RSS-first and configured in `data/market-sources.registry.json`. Manual curated sources are listed in `data/market-manual-sources.json` and can be added to `data/market-intelligence.json` when a link is worth retaining.

The market intelligence workflow runs hourly via `.github/workflows/market-intelligence.yml` and retains matching links for 30 days, capped at 100 items by default.


## Events & Briefings add-on

This build is based on MVP v1.0.23 and adds the Events & Briefings module only. It does not include the later regulatory-filter rewrites from v1.0.17-v1.0.22.

The dashboard shows Market Intelligence and Events & Briefings side by side. The full events archive is available via `#events`.

Key event files:

```text
data/events.json
data/events-sources.registry.json
scripts/fetch-events.mjs
.github/workflows/events-briefings.yml
```


## Final stable v1.0.23 scope

This package uses the stable v1.0.15 frontend baseline and adds the agreed scoped monitoring model.

The regulatory feed is not a general regulatory feed. It is limited to digital assets, tokenisation/tokenization, tokenised assets/securities, stablecoins, digital money, digital cash, tokenised/tokenized deposits, deposit tokens, bank-issued tokens, commercial bank money tokens, CBDC, digital settlement assets, DLT, digital asset custody, tokenised collateral and adjacent institutional settlement/collateral/securities-lending topics only where there is a real digital-assets / tokenisation / FMI angle.

Dashboard preview limits:

```text
Market Intelligence: 5 items
Events & Briefings: 4 items
Regulatory Radar: 3 radar-eligible regulatory items
```
