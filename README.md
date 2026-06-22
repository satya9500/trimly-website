# Trimly — marketing website

Static marketing site for **Trimly** (AI hairstyle match + salon discovery).
Plain HTML/CSS/JS — no build step. Hosted on **GitHub Pages** at **https://trimly.info**.

## Structure
- `index.html` — landing page
- `privacy.html`, `terms.html` — legal pages
- `styles.css`, `main.js` — styling + light interactions
- `og-image.png`, `favicon.svg`, `site.webmanifest` — assets/icons
- `robots.txt`, `sitemap.xml` — SEO
- `CNAME` — custom domain for GitHub Pages

## Edit & deploy
Edit files, then:
```
git add -A && git commit -m "Update site" && git push
```
GitHub Pages redeploys automatically on push to `main`.
