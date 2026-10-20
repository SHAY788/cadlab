# CADLAB Website Starter

A simple, bilingual-ready static website starter for a research laboratory.

## Editing
- Edit `assets/content.js` to change research areas, people, publications, projects and news.
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
