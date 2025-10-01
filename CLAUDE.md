# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start local dev server at http://localhost:4321
npm run build      # Generate production build in dist/
npm run preview    # Preview the production build locally
npm run check      # Type-check content collections and Astro components
```

## Architecture

### Tech Stack
- **Astro 5** for static site generation with island architecture
- **React 19** for interactive components (search, hero animations)
- **Tailwind CSS** for styling
- **MDX** for content with frontmatter
- **MiniSearch** for client-side search
- **Framer Motion & Motion One** for scroll animations

### Content Collections System
The site uses Astro's typed content collections defined in [src/content/config.ts](src/content/config.ts):

- **blog**: MDX files in `src/content/blog/*.mdx` with frontmatter for title, description, pubDate, heroImage, featured flag, draft flag, and tags
- **projects**: MDX files in `src/content/projects/*.mdx` with title, summary, launchedAt, featured flag, tags, and external links
- **resume**: JSON files in `src/content/resume/*.json` with section (experience/education/highlight), title, organization, date range, and bullet points

All content is type-checked via Zod schemas. Missing required fields will fail during `astro check` or builds.

### Routing Structure
Astro file-based routing:
- `src/pages/index.astro` - Homepage with hero, featured content
- `src/pages/blog/[...slug].astro` - Dynamic blog post pages
- `src/pages/blog/index.astro` - Blog listing page
- `src/pages/projects/[slug].astro` - Dynamic project pages
- `src/pages/projects/index.astro` - Projects listing page
- `src/pages/about.astro` - About page with resume timeline
- `src/pages/search-index.json.ts` - JSON endpoint for MiniSearch index
- `src/pages/rss.xml.js` - RSS feed generation

### Path Aliases
Configured in [astro.config.mjs](astro.config.mjs):
- `@components` → `./src/components`
- `@layouts` → `./src/layouts`
- `@content` → `./src/content`
- `@styles` → `./src/styles`
- `@lib` → `./src/lib`

### Client-Side Search
The search system spans multiple files:
1. [src/pages/search-index.json.ts](src/pages/search-index.json.ts) builds a JSON endpoint with all blog posts and projects
2. [src/components/SearchPanel.tsx](src/components/SearchPanel.tsx) fetches the index and uses MiniSearch for fuzzy search with title/tag boosting
3. Search queries look across title, summary, content, and tags with fuzzy matching (0.2) and prefix matching enabled

### Scroll Animations
[src/lib/reveal.ts](src/lib/reveal.ts) provides `initReveal()` which animates elements with `data-reveal` attributes on scroll into view. Elements can specify `data-reveal-delay` for staggered animations. Uses Motion One's `inView` API.

### Optional Integrations
Set these environment variables to enable features:
- `PUBLIC_FORM_ENDPOINT` - Formspree endpoint for contact form (falls back to mailto link)
- `PUBLIC_PLAUSIBLE_DOMAIN` - Enable Plausible analytics
- `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY`, `PUBLIC_GISCUS_CATEGORY_ID` - Enable Giscus comments on blog posts

### Deployment
- Deploys to GitHub Pages via `.github/workflows/deploy.yml`
- Pushes to `main` trigger automatic builds and deploys
- `public/CNAME` maintains custom domain `www.joshua-mason.com`
- Built on Node 20, uses `actions/deploy-pages@v4`
