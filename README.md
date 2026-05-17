# NFSA Elite Raiders Soccer

Static website for the **NFSA Elite Raiders Soccer** youth development program. Features a 96-drill curriculum, NFL-style OTA + Training Camp tactics installation, and 5 formations for ages 12–19.

## Live Site

Deployed via GitHub Pages: [nfsa.eliteraiderssoccer.com]

## Project Structure

```
nfsa-eliteraiderssoccer/   # site source (deployed folder)
  index.html               # single-page site
.github/workflows/
  deploy-nfsa.yml          # GitHub Actions — auto-deploys main → gh-pages
```

## Deployment

Pushes to `main` automatically deploy via the [JamesIves/github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action) workflow. No build step — the `nfsa-eliteraiderssoccer/` folder is served directly.
