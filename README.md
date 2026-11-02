# CADLAB Website Starter

A simple, bilingual-ready static website starter for a research laboratory.

## Editing
- Edit `assets/content.js` for homepage summaries, research areas and news. Full personnel, publication and project records remain in their respective HTML pages.
- Edit `index.html` for site structure and `assets/styles.css` for styles.
- Do not publish personally identifiable details, photos, or copyright-protected files without approval.
- All entries are placeholders or preliminary descriptions; verify before naming the website official.

## GitHub Pages
1. Upload `index.html`, `assets/`, `archive/`, `.nojekyll` and this file to a public GitHub repo named `cadlab`.
2. Settings > Pages > Source: Deploy from a branch > main > /(root) > Save.
3. Site appears at `https://USERNAME.github.io/cadlab/`.

## Cloudflare Pages
1. Workers & Pages > Create > Pages > import Git repository.
2. Select the same repo; production branch `main`.
3. Build command `exit 0`; output directory `.`.
4. Deploy; the project gets a `*.pages.dev` address.

## Backups
Export Git repository ZIP regularly; use separate off-site storage. Preserve original historical media independently. The git repo alone is not a complete backup.

## Shared layout and verification

All 15 HTML pages use the same static navigation and footer, maintained by
`tools/sync-layout.py`. After changing the shared template, run:

```sh
python tools/sync-layout.py
```

`assets/styles.css` owns the common design and homepage layout;
`assets/pages.css` owns the secondary-page content layouts.
`assets/navigation.js` is shared by every page; `assets/site.js` only renders
homepage content. The original logo file and historical media are preserved.

Phase 2 verification (export the baseline into a directory outside the site):

```sh
mkdir -p /tmp/cadlab-baseline
git archive 8f4d6c79c65fd17fa96062e48404bac31feaaeda | tar -x -C /tmp/cadlab-baseline
python tools/check-site.py --baseline /tmp/cadlab-baseline
CADLAB_BASELINE=/tmp/cadlab-baseline REVIEW_OUTPUT=/tmp/cadlab-review node tools/check-browser.cjs
```

The browser check requires the `playwright` Node module and Chromium at
`/usr/bin/chromium`. It serves both checkouts only on a temporary loopback port.
Its Google Maps frame is stubbed locally, so it does not test the external map
service. Screenshots cover the first 1000 pixels, not the entire page.
See `.github/review/phase2/REPORT.md` for the review results and comparisons.
