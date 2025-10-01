# Joshua Mason — Personal Website

Astro-powered personal site deployed to GitHub Pages. It blends static performance with interactive islands for a motion-rich portfolio, blog, and resume.

## Highlights
- **Astro + Tailwind** for fast static rendering and a consistent design system
- **MDX collections** for blog posts, project write-ups, and resume timeline data
- **MiniSearch** client-side index so visitors can instantly filter content
- **Motion-enhanced hero** and scroll reveals powered by Framer Motion and Motion One
- **Ready-to-ship GitHub Actions workflow** that publishes to Pages with a custom domain

## Quick start
```bash
npm install
npm run dev
```
Visit [http://localhost:4321](http://localhost:4321) to preview the site. Content lives in `src/content/` so edits trigger instant reloads.

## Directory tour
```
src/
  components/      # Site-wide UI (hero, cards, search, contact form, comments)
  content/         # MDX + JSON collections (blog, projects, resume timeline)
  layouts/         # Shared page layouts, including blog posts
  lib/             # Client-side helpers (scroll reveal animations)
  pages/           # Astro routes (home, blog, projects, JSON search index)
```
Assets dropped in `public/` are copied through to the final `dist/` output. The `public/CNAME` file keeps the custom domain mapped during deploys.

## Content model
- `src/content/blog/*.mdx` — long-form writing with frontmatter for tags, hero images, and feature flags
- `src/content/projects/*.mdx` — portfolio entries with launch dates, stack tags, and outbound links
- `src/content/resume/*.json` — timeline items (experience, education, highlights) used across pages

Frontmatter is type-checked through `src/content/config.ts`, so missing fields fail fast during `astro check` or builds.

## Environment knobs
Set these in your repository or local `.env` to unlock optional integrations:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_FORM_ENDPOINT` | Formspree (or similar) endpoint for the contact form. Absent ⇒ graceful email fallback. |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Enables the Plausible analytics script with the provided domain. |
| `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY`, `PUBLIC_GISCUS_CATEGORY_ID` | Turn on Giscus-powered comments on blog posts. |

## Useful scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Generate the production build in `dist/` |
| `npm run preview` | Preview the build locally |
| `npm run check` | Type-check content collections and Astro components |

## Deployment
The repo ships with `.github/workflows/deploy.yml`. Once GitHub Pages is configured to use GitHub Actions:
1. Push to `main`.
2. The workflow builds the site on Node 20, uploads `dist/` as an artifact, and deploys with `actions/deploy-pages@v4`.
3. `public/CNAME` keeps `www.joshua-mason.com` mapped automatically.

If you need to tweak the action (additional tests, linting, etc.), edit the `build` job steps before the upload.

## Next ideas
- Flesh out additional blog entries and project pages to exercise the MDX components.
- Swap in real imagery for hero/project cards via `public/images/`.
- Configure Formspree + Giscus + Plausible using the environment variables above.
- Extend the MiniSearch index with additional fields (e.g., resume entries) if you want one search box for everything.
