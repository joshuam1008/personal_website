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
- `@config` → `./src/config`

### Theme System
The site supports multiple themes via [src/config/themes.ts](src/config/themes.ts):
- **Dark Glassmorphism** (default) - Current design with indigo/pink gradients
- **Matrix Terminal** - Black/green CRT aesthetic with scanlines and Matrix rain effect

Note: Only two themes are currently fully implemented. The theme system applies CSS custom properties dynamically only for the terminal theme; the default theme uses compiled Tailwind colors.

Theme selection dropdown in header ([ThemeSelector.tsx](src/components/ThemeSelector.tsx)). Settings stored in `localStorage`. The `data-theme` attribute on `documentElement` enables theme-specific CSS.

### Animation System
Configurable animation system via [src/config/animations.ts](src/config/animations.ts):
- **Typewriter effect** - Hero headline typing animation
- **Quote ripple** - Letter-by-letter reveal in HeroMotion component
- **Card tilt** - 3D tilt on hover for ProjectCard components
- **Shimmer effects** - Animated shimmer sweep across glass cards
- **Parallax scrolling** - Elements with `data-parallax` attribute
- **Cursor trail** - Particle trail following cursor (disabled by default for performance)
- **Matrix rain** - Terminal theme background effect
- **Scroll reveals** - Fade-up animations with `data-reveal` attribute

Settings panel (gear icon, bottom-right) allows toggling individual animations. All settings stored in `localStorage`.

### Client-Side Search
The search system spans multiple files:
1. [src/pages/search-index.json.ts](src/pages/search-index.json.ts) builds a JSON endpoint with all blog posts and projects
2. [src/components/SearchPanel.tsx](src/components/SearchPanel.tsx) fetches the index and uses MiniSearch for fuzzy search with title/tag boosting
3. Search configuration centralized in [src/lib/search-config.ts](src/lib/search-config.ts)

### Scroll Animations
Multiple animation systems:
- [src/lib/reveal.ts](src/lib/reveal.ts) - Base scroll reveal with Motion One's `inView` API
- [src/lib/parallax.ts](src/lib/parallax.ts) - Parallax scroll effects for `data-parallax` elements
- [src/lib/shimmer.ts](src/lib/shimmer.ts) - Shimmer animations for glass cards
- [src/lib/cursor-trail.ts](src/lib/cursor-trail.ts) - Cursor particle trail effect
- [src/lib/matrix-rain.ts](src/lib/matrix-rain.ts) - Matrix rain effect for terminal theme

### Optional Integrations
Set these environment variables to enable features:
- `PUBLIC_FORM_ENDPOINT` - Formspree endpoint for contact form (falls back to mailto link)
- `PUBLIC_PLAUSIBLE_DOMAIN` - Enable Plausible analytics
- `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY`, `PUBLIC_GISCUS_CATEGORY_ID` - Enable Giscus comments on blog posts

### Deployment
- Deploys to GitHub Pages via `.github/workflows/deploy.yml`
- Pushes to `main` trigger automatic builds and deploys
- `public/CNAME` maintains custom domain `www.joshua-mason.com`
- Built on Node 22, uses `actions/deploy-pages@v4`
