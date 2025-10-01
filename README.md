# Joshua Mason — Personal Website

[![Deploy site](https://github.com/joshuam1008/personal_website/actions/workflows/deploy.yml/badge.svg)](https://github.com/joshuam1008/personal_website/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/live-www.joshua--mason.com-blue)](https://www.joshua-mason.com)

Astro-powered personal site deployed to GitHub Pages. It blends static performance with interactive islands for a motion-rich portfolio, blog, and resume.

## Highlights
- **Astro + Tailwind** for fast static rendering and a consistent design system
- **6 dynamic themes** including Matrix Terminal, Neon Cyberpunk, and Minimal Light with live switching
- **Configurable animation system** with 8+ effects (typewriter, card tilt, parallax, shimmer, Matrix rain) controllable via in-browser settings panel
- **Mobile-responsive** with hamburger menu navigation for smaller screens
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
  components/      # Site-wide UI (hero, cards, search, contact form, theme/animation controls)
  config/          # Theme definitions and animation configuration system
  content/         # MDX + JSON collections (blog, projects, resume timeline)
  layouts/         # Shared page layouts, including blog posts
  lib/             # Client-side helpers (animations, parallax, shimmer, cursor trail, Matrix rain)
  pages/           # Astro routes (home, blog, projects, JSON search index)
```
Assets dropped in `public/` are copied through to the final `dist/` output. The `public/CNAME` file keeps the custom domain mapped during deploys.

## Content model
- `src/content/blog/*.mdx` — long-form writing with frontmatter for tags, hero images, and feature flags
- `src/content/projects/*.mdx` — portfolio entries with launch dates, stack tags, and outbound links
- `src/content/resume/*.json` — timeline items (experience, education, highlights) used across pages

Frontmatter is type-checked through `src/content/config.ts`, so missing fields fail fast during `astro check` or builds.

## Customization

### Theme System
The site includes 6 themes accessible via the palette icon dropdown in the header:
- **Dark Glassmorphism** (default) - Indigo and pink gradients with frosted glass effects
- **Matrix Terminal** - Black/green CRT aesthetic with scanlines and Matrix rain effect
- **Neon Cyberpunk** - Hot pink and cyan with intense neon glows
- **Minimal Light** - Clean white theme optimized for daytime viewing
- **Dracula** - Purple and pink pastels on dark background
- **Nord** - Cool blues and whites inspired by Nordic color palettes

Theme selection is persisted in `localStorage` and instantly applies CSS custom properties for dynamic color switching.

### Animation Settings
Click the gear icon (bottom-right) to open the animation settings panel. Toggle individual effects:
- **Typewriter effect** - Hero headline types out character-by-character
- **Quote ripple** - Letter-by-letter reveal animation on the quote block
- **Card tilt** - 3D parallax tilt effect on hover for project cards
- **Shimmer effects** - Animated light sweep across glass card surfaces
- **Parallax scrolling** - Background elements move at different speeds (add `data-parallax` attribute)
- **Cursor trail** - Particle trail following mouse movement (disabled by default for performance)
- **Matrix rain** - Green character waterfall effect (only visible on Matrix Terminal theme)
- **Scroll animations** - Fade-up reveals triggered by scroll position

All animation preferences are stored in `localStorage` and can be toggled without refreshing the page.

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
2. The workflow builds the site on Node 22, uploads `dist/` as an artifact, and deploys with `actions/deploy-pages@v4`.
3. `public/CNAME` keeps `www.joshua-mason.com` mapped automatically.
4. The deployment badge at the top of this README updates automatically to show build status.

If you need to tweak the action (additional tests, linting, etc.), edit the `build` job steps before the upload.

## Next ideas
- **Create custom themes** - Add your own theme definitions in `src/config/themes.ts` following the existing pattern
- **Build new animation effects** - Extend `src/lib/` with additional animation modules and register them in `src/config/animations.ts`
- **Flesh out content** - Add more blog entries and project pages to exercise the MDX components
- **Optimize images** - Swap in real imagery for hero/project cards via `public/images/`
- **Enable integrations** - Configure Formspree + Giscus + Plausible using the environment variables
- **Enhance search** - Extend the MiniSearch index with additional fields (e.g., resume entries) for comprehensive site-wide search
- **Theme-specific effects** - Create unique visual effects that activate only on specific themes (like Matrix rain for Terminal theme)
