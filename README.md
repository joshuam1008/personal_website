# Joshua Mason — Terminal Portfolio

[![Deploy site](https://github.com/joshuam1008/personal_website/actions/workflows/deploy.yml/badge.svg)](https://github.com/joshuam1008/personal_website/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/live-www.joshua--mason.com-blue)](https://www.joshua-mason.com)

An interactive, terminal-emulator themed personal website deployed to GitHub Pages. It blends the nostalgia of a vintage CRT terminal with modern web technologies, built using **Astro** for static generation and **React** for the terminal UI.

## Highlights
- **Custom React Terminal Engine**: Supports command validation, arrow-key history navigation, tab-completion, and auto-scrolling.
- **16+ Interactive Commands**: Explore experience (`resume`), portfolio (`projects`), writing (`blog`), and contact info (`socials`) via a CLI interface.
- **4 Custom CSS Themes**: Switch between Green (default), Amber, Dracula, and Matrix themes instantly via the `themes set <name>` command, with preference saved in `localStorage`.
- **Pure CSS Styling**: No Tailwind or external UI libraries. Uses raw CSS with custom properties for CRT scanlines, text glow, and crisp IBM Plex Mono typography.
- **Content Collections**: Fully static content pipeline using Astro's collections for MDX (blog/projects) and JSON (resume timeline) with build-time serialization.
- **Fully Responsive**: Adapts automatically with dedicated mobile layouts (e.g., compact ASCII art, shortened shell prompt) without losing terminal functionality.

## Quick Start
```bash
npm install
npm run dev
```
Visit [http://localhost:4321](http://localhost:4321) to preview the site. 

Content lives in `src/content/` (MDX/JSON) and `src/data/` (TypeScript arrays).

## Directory Structure
```
src/
  components/      # React terminal components (Terminal engine, Output router, TermPrompt)
    commands/      # Individual command handler components (Welcome, About, Resume, etc.)
  content/         # Astro content collections (MDX for blog/projects, JSON for resume)
  data/            # Statically defined data arrays (commands list, skills, socials)
  pages/           # Astro entrypoints (index.astro, rss.xml.js)
  styles/          # Pure CSS styles (terminal.css)
```

## Creating Content

### Resume
Edit the JSON files in `src/content/resume/`. Each file represents a timeline item (experience, education, or highlight). The terminal's `resume` command parses and renders these.

### Projects & Blog
Add `.mdx` files to `src/content/projects/` and `src/content/blog/`. Frontmatter types are strictly validated by `src/content/config.ts`. The `projects` and `blog` terminal commands will automatically index and display them.

### Skills & Socials
Update the TypeScript arrays in `src/data/skills.ts` and `src/data/socials.ts` to reflect your current stack and contact info.

## Useful Commands
| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server at localhost:4321 |
| `npm run build`| Generate the static production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## Deployment
This repository is configured to deploy automatically to GitHub Pages.
1. Push to the `main` branch.
2. The GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site using Node 22 and deploys it.
3. The custom domain is preserved automatically.

*(Note: If you want to view the previous Astro+Tailwind glassmorphism version of this site, check out the `archive/astro-glassmorphism` branch or the `v1.0-astro-glassmorphism` release tag.)*
