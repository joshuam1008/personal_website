# Agent Instructions

## What this site is

A simulated desktop operating system, not a single-page terminal. `src/pages/index.astro`
renders one `client:only="react"` island, `<Desktop>`, which mounts a `WindowManagerProvider`,
a `BootScreen`, a top status bar, a bottom taskbar, six desktop icons, and six independently
draggable/resizable windows (`OSWindow`). One of those windows contains the original terminal
(`Terminal.tsx`) with its own command history, Tab-completion, and an `open <app>` command that
bridges into the window system.

### Routes

- `/` — the desktop OS (client-rendered), plus a `<noscript>` fallback with real links for
  crawlers and JS-disabled visitors
- `/projects/<slug>` — server-rendered case study pages, one per project in the `projects`
  content collection
- `/blog/<slug>` — server-rendered blog post pages (the collection is currently empty, so no
  pages exist yet; the route is built and ready for when posts land)
- `/404` — a themed not-found page
- `/rss.xml` — RSS feed

### The virtual filesystem

`src/lib/filesystem.ts` builds a Unix-style tree (`ls`, `cd`, `cat`, `pwd`) from the same
`resume`/`projects`/`blog` props the windows receive, so the filesystem and the windows can
never drift out of sync — there is exactly one source for each piece of content.

### Adding a command

1. Add the component in `src/components/commands/`.
2. Register it in `src/data/commands.ts` (drives `help` and Tab-completion).
3. Wire it into the `Output.tsx` switch.

**Side effects belong in `useEffect`, never in the render body.** A previous version of the
`open` command called `openWindow()` directly in the render body; the resulting `setState`
re-rendered the component, which called `openWindow()` again, forever — an infinite loop that
crashed the page (`Maximum update depth exceeded`). Every side-effecting command
(`Open`, `Cd`, `Themes`, `Projects`, `Socials`, `Blog`) now follows the same pattern: check
`rerender` inside a `useEffect` with an empty dependency array.

**Hooks go above every conditional `return`, always** — not after an early guard. React requires
a stable hook order across renders; two components (`OSWindow`, `Cd`) previously violated this
and only survived by luck (their guard conditions happened to never trigger). Put every
`useState`/`useEffect`/`useRef` call before the first `if (...) return`.

### Theming

Four themes (`green`, `amber`, `dracula`, `matrix`) in `src/components/commands/Themes.tsx`.
Applied via `data-theme` on `<html>`, persisted in `localStorage` under `terminal-theme`, and
restored by an inline pre-paint script in every page's `<head>` to avoid a flash.

`--text-dim` is **metadata-only and contrast-locked** — dates, tags, slugs, path segments. It is
deliberately tuned to clear 4.5:1 (WCAG AA) against each theme's own background *including* the
CRT scanline overlay (`#terminal-root::after`), which composites roughly 50% coverage of
`var(--scanline)` and quietly costs about 0.5 of contrast ratio on top of the raw color math. Do
not "round" these hex values or swap them for something that merely looks close — they sit just
above the threshold on purpose. `--text-secondary` is the prose color (7:1 / AAA) for anything a
visitor is meant to actually read — use the `.term-body` class or `var(--text-secondary)`
directly, never `--text-dim`, for full sentences.

### Type system

- **IBM Plex Mono** — body default, terminal, anything shell-like
- **JetBrains Mono** — OS chrome only: top bar, window titles, taskbar, card titles
- **system-ui** — window body content (`.info-window-body`), for readable prose

Do not introduce a fourth family, and do not let anything inherit an unset one — the global
`body` rule in `terminal.css` is what everything else falls back to; it was accidentally deleted
once during the desktop redesign and the terminal silently rendered in Times until it was
restored.

### Local tooling

`.claude/launch.json` configures the dev server (`npm run dev`, port 4321) for browser-based
preview tooling.

## Non-Interactive Shell Commands

**ALWAYS use non-interactive flags** with file operations to avoid hanging on confirmation prompts.

Shell commands like `cp`, `mv`, and `rm` may be aliased to include `-i` (interactive) mode on some systems, causing the agent to hang indefinitely waiting for y/n input.

**Use these forms instead:**
```bash
# Force overwrite without prompting
cp -f source dest           # NOT: cp source dest
mv -f source dest           # NOT: mv source dest
rm -f file                  # NOT: rm file

# For recursive operations
rm -rf directory            # NOT: rm -r directory
cp -rf source dest          # NOT: cp -r source dest
```

**Other commands that may prompt:**
- `scp` - use `-o BatchMode=yes` for non-interactive
- `ssh` - use `-o BatchMode=yes` to fail instead of prompting
- `apt-get` - use `-y` flag
- `brew` - use `HOMEBREW_NO_AUTO_UPDATE=1` env var
