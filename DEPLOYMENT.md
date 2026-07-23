# Deployment Guide

## Recommended deployment: GitHub + Cloudflare Pages

1. Create a GitHub repository.
2. Upload the contents of this folder.
3. Choose a production domain.
4. Run:

```bash
npm run configure:url -- https://your-domain.example
npm run build:data
```

5. Commit the changed files.
6. Connect the repository to Cloudflare Pages.
7. Build command: leave empty or use `npm run build:data`.
8. Output directory: `/`.

## GitHub Actions monitoring

The included workflow is located at:

```text
.github/workflows/regulatory-monitor.yml
```

It runs at 06:30 and 07:30 UTC, and the script keeps only the run corresponding to approximately **07:30 Europe/London**. This handles the BST/GMT shift without changing the workflow seasonally.

Manual runs are supported through `workflow_dispatch`.

## GitHub Pages

This package includes `.nojekyll`, so GitHub Pages should serve the static files without Jekyll processing.

## Domain and SEO placeholders

Before public launch, replace all `https://example.com/` placeholders with your real domain using:

```bash
npm run configure:url -- https://your-domain.example
```

This updates:

- canonical URL,
- Open Graph URL,
- Open Graph image URL,
- JSON-LD URL,
- `robots.txt`,
- `sitemap.xml`,
- `site.webmanifest`.

## Corporate-safe positioning

The app is intentionally configured as an informational regulatory workspace:

- no wallet integrations,
- no exchange APIs,
- no trading terminology as the primary product language,
- no prices or portfolio tracking,
- no external advertising scripts,
- no user login in MVP v1.0,
- clear About, Coverage and Disclaimer sections.

Corporate filtering is never guaranteed, because categorisation depends on the organisation and vendor. The included metadata and content structure are designed to support classification as an informational, business, financial services, reference or regulatory research site.
