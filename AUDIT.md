# Audit — joshua-mason.com

**Audited commit:** `0a56218` (main, after the "full os redesign" merge)
**Date:** 2026-08-15

Method: `/impeccable audit` (web) + its mechanical detector, live browser
inspection at 1440×900 and 375×812, console/error capture, and analysis of the
built output. Every finding below was reproduced in the running site or read
directly out of the source — none are inferred.

> This supersedes an earlier audit written against commit `7e77bcd`, before the
> desktop-OS redesign landed. That version was stale and has been discarded.

---

## What the site is now

A **simulated desktop operating system**, not a single terminal. On load: a
2.5-second BIOS boot animation, then a desktop with a top status bar, six
launcher icons, draggable/resizable/minimizable/maximizable windows, and a
bottom taskbar. The terminal is now one window among six, backed by a virtual
filesystem (`src/lib/filesystem.ts`) supporting `ls`, `cd`, `cat`, `pwd`, plus
`open <app>` to launch other windows.

It is a substantially more ambitious product than what it replaced, and the
window manager is real work. It also currently has a command that crashes the
page.

---

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 1/4 | `--text-dim` fails AA and now paints the desktop icon labels — the site's primary navigation |
| 2 | Performance | 2/4 | Every visit is gated behind a 2.5 s boot animation with no skip |
| 3 | Responsive design | 2/4 | Mobile icon rail is genuinely good; window positions are hard-coded pixels |
| 4 | Theming | 2/4 | Token system still strong, but the global `body` rules were deleted in the redesign |
| 5 | Implementation integrity | 1/4 | `open <app>` infinite-loops and crashes; two Rules-of-Hooks violations |
| **Total** | | **8/20** | **Poor — major overhaul** |

---

## Implementation integrity verdict

**Fail.** The redesign shipped a documented command that renders the site
unusable, two React correctness violations, and three mutually contradictory
biographies of the same person.

`open` is listed in `help`, has registered tab-completion sub-commands
(`about`, `projects`, `blog`, `skills`, `contact`), and is the advertised bridge
between the terminal and the window system — the conceptual centrepiece of the
OS metaphor. Running it throws `Maximum update depth exceeded` and wedges the
renderer hard enough that the page stops responding to navigation.

The window manager underneath is sound: z-ordering, focus, minimize/maximize,
pointer-capture dragging, and taskbar restore all work. The failures are at the
seams — where React's rules were bent, and where content was duplicated instead
of shared.

---

## Executive summary

- **Score: 8/20 (Poor).**
- **Issue count: 4 × P0, 12 × P1, 11 × P2, 6 × P3.**

Top five:

1. **`open <app>` crashes the page.** `Open.tsx` calls `openWindow()` in the
   render body; the resulting state update re-renders the component, which calls
   it again, forever. Confirmed in console: `Maximum update depth exceeded`.
2. **Desktop typography is broken.** The redesign deleted the global `body`
   rule from `terminal.css` and only restored it inside os.css's `max-width:
   640px` block. On desktop, `body` computes to `font-family: Times`,
   `color: rgb(0,0,0)`, `background: transparent`. The terminal — the thing the
   whole site is named for — renders in Times New Roman.
3. **`--text-dim` fails WCAG AA in all four themes** and its blast radius grew:
   it now colors desktop icon labels (0.65 rem, the primary nav), window titles,
   taskbar buttons, résumé dates, and all window body prose.
4. **Two Rules-of-Hooks violations.** `OSWindow.tsx` calls `useState` after an
   early `return null`; `Cd.tsx` calls `useEffect` after one. Both are latent
   crashes.
5. **The blog is dead in five places at once** — and the boot screen asserts
   `[ blog ] OK` while mounting it.

**Recommended next step:** Phase 1 of the plan. Four of the six P0/P1 leaders are
small, surgical fixes; the site's perceived quality jumps disproportionately.

---

## Detailed findings

### P0 — blocking

**[P0-1] `open <app>` infinite render loop crashes the page**
- Location: [src/components/commands/Open.tsx:11](src/components/commands/Open.tsx:11)
- Category: Implementation integrity
- Reproduced: run `open skills`. Console fills with
  `Maximum update depth exceeded. This can happen when a component repeatedly
  calls setState inside componentWillUpdate or componentDidUpdate`, wrapped in
  `There was an error during concurrent rendering`. The renderer stops
  responding; even a navigation to the same URL timed out afterwards.
- Cause: the side effect runs during render, not in an effect:
  ```tsx
  if (rerender && arg.length > 0) {
    const appName = arg[0].toLowerCase();
    if (VALID_APPS.includes(appName) && openWindow) {
      openWindow(appName);          // ← setState during render
    }
  }
  ```
  `openWindow` calls `setWindows` and `setNextZIndex`. That re-renders the
  provider subtree, `Open` renders again, `rerender` is still `true` (it is
  derived from `entry.id === latestId`, which has not changed), so it fires
  again. There is no termination condition.
- Impact: total loss of the page. The one command that ties the terminal to the
  window system is the one that kills it.
- Recommendation: move the call into `useEffect(..., [])`, matching the pattern
  every other side-effecting command already uses (`Themes.tsx`, `Projects.tsx`,
  `Socials.tsx`, `Cd.tsx`).

**[P0-2] Global `body` styling was deleted; desktop renders in Times**
- Location: [src/styles/terminal.css:79](src/styles/terminal.css:79) — the rule
  removed in the redesign; partially restored only at
  [src/styles/os.css:439](src/styles/os.css:439) inside `@media (max-width: 640px)`
- Category: Theming
- Measured at 1440×900:
  ```
  body        font-family: Times   color: rgb(0,0,0)   background: rgba(0,0,0,0)
  #terminal-root  font-family: Times
  .term-prompt    font-family: Times
  #terminal-input font-family: Times
  .term-ascii     font-family: monospace   ← only because <pre> has a UA default
  ```
  IBM Plex Mono and JetBrains Mono are both loaded and applied where a rule names
  them explicitly (`.boot-text`, `.os-topbar`, `.os-window-title`,
  `.info-card-title`). Everything that relied on inheritance lost it.
- Impact: on desktop, the terminal's prompt, output, and input all render in a
  proportional serif. The ASCII banner survives only by accident. The site's
  entire identity depends on monospace and it is absent on the primary
  viewport. Mobile is unaffected, which is why this is easy to miss.
- Secondary: `background: transparent` + `color: black` on `body` means anything
  not covered by `.os-desktop` paints black-on-white — including the pre-hydration
  frame, since the island is `client:only`.
- Recommendation: restore a global rule setting `background`, `color`,
  `font-family`, `font-size`, and `line-height` on `body`, and delete the
  duplicate inside the mobile media query. Verify by asserting
  `getComputedStyle(document.body).fontFamily` contains `IBM Plex Mono`.

**[P0-3] `--text-dim` below WCAG AA in all four themes**
- Location: [src/styles/terminal.css:15](src/styles/terminal.css:15) and the
  `--text-dim` line in each other theme block
- Category: Accessibility · WCAG 1.4.3 (AA)
- Measured against each theme's own background:

  | Theme | OS chrome (no overlay) | Inside terminal (with scanline) |
  |---|---|---|
  | green | 4.12:1 | 3.57:1 |
  | amber | 3.51:1 | 3.04:1 |
  | dracula | 3.03:1 | 2.83:1 |
  | matrix | 3.80:1 | 3.11:1 |

  All eight values fail the 4.5:1 minimum. The right column accounts for
  `#terminal-root::after`, the scanline gradient that composites ~50 % coverage
  of `var(--scanline)` over terminal content.
- Impact: the redesign widened this token's reach considerably. It now colors
  `.icon-label` (the desktop icon captions — the primary navigation, at
  0.65 rem ≈ 10.4 px), `.os-window-title`, `.os-taskbar-btn`, `.tray-label`,
  `.info-hero p`, `.exp-date`, `.experience-row li`, and the body prose of the
  About/Projects/Blog windows.
- Recommendation: retune per theme and split the token — see Phase 2 of the
  plan, which carries pre-computed values.

**[P0-4] Zero server-rendered content**
- Location: [src/pages/index.astro:148](src/pages/index.astro:148) — `client:only="react"`
- Category: Implementation integrity / SEO
- Verified in `dist/index.html`: the entire body text is
  `"Joshua Mason — Terminal Portfolio"` (one `sr-only` heading) plus an inline
  style rule. Nothing else.
- Impact: crawlers that do not execute JS index nothing. JS-disabled or
  failed-bundle visitors get a **white** screen (see P0-2 — `body` has no
  background). The `<head>` carries Open Graph tags, Twitter cards, JSON-LD
  `Person` structured data, a sitemap link, and an RSS link, all pointing at a
  document with no content.
- Recommendation: a `<noscript>` fallback plus real `/projects/<slug>` routes.
  Full SSR of the desktop is a rewrite and is not proposed.

### P1 — major

**[P1-1] Rules of Hooks violation in `OSWindow`**
- Location: [src/components/OSWindow.tsx:35](src/components/OSWindow.tsx:35)
  ```tsx
  const win = windows.get(id);
  if (!win) return null;        // ← early return
  const [left, setLeft] = useState(initialLeft);   // ← hooks after it
  ```
  Also `if (!wmContext) throw` above it. Six hooks (`useState` ×4, `useRef` ×5)
  sit behind two conditional returns.
- Impact: today all six window ids are seeded in the provider so `win` is never
  undefined, and it does not crash. It is a loaded gun: the first time a window
  id is added to `Desktop.tsx` but not to `WindowManagerProvider`'s seed list,
  React throws `Rendered fewer hooks than expected` and the desktop dies.
- Recommendation: hoist all hooks above the guards; move the early returns below.

**[P1-2] Rules of Hooks violation in `Cd`**
- Location: [src/components/commands/Cd.tsx:16](src/components/commands/Cd.tsx:16)
  — `if (!filesystem) return null;` precedes `useEffect`.
- Same class of defect, same fix.

**[P1-3] A document-level listener steals focus from the entire page**
- Location: [src/components/Terminal.tsx:67](src/components/Terminal.tsx:67)
  ```tsx
  document.addEventListener('click', focusInput);
  ```
- Reproduced: clicking the **About** desktop icon leaves
  `document.activeElement.id === 'terminal-input'`.
- Impact: this was a minor annoyance in the single-terminal design. In an OS
  shell it is a functional defect — every click anywhere (desktop icons, window
  close/minimize/maximize buttons, taskbar buttons, links inside the About or
  Projects windows) yanks keyboard focus into the terminal input, which may be
  behind another window or minimized. Keyboard users cannot hold focus on any
  other surface, and typing after interacting with a window goes to the terminal.
- Recommendation: scope to the terminal window's own root and skip clicks on
  `a`, `button`, and clicks that end a text selection.

**[P1-4] `neofetch` silently drops its last two rows**
- Location: [src/components/commands/Neofetch.tsx:46](src/components/commands/Neofetch.tsx:46)
- `LOGO` has 6 lines, `info` has 8 rows, and the render is `LOGO.map(...)` with
  `info[i]` — so indices 6 and 7, **Stack** and **Uptime**, never render.
  Confirmed: output ends at `Shell: portfolioSH 1.0`.
- Compounding: the component runs a `setInterval` at 1 Hz updating `uptime`
  state that is never displayed, re-rendering forever for nothing.
- Recommendation: iterate the longer of the two lists, or pad `LOGO`. Then the
  uptime ticker earns its keep.

**[P1-5] About window shows raw ISO dates and an empty end date**
- Location: [src/components/windows/AboutWindow.tsx:38](src/components/windows/AboutWindow.tsx:38)
  — `{e.start} – {e.end}`
- Measured output: `"2025-04 – "`, `"2024-05 – 2024-08"`, `"2023-05 – 2023-08"`, …
- Two defects: the raw `YYYY-MM` strings are never formatted (`Resume.tsx`
  already has a `formatDate` helper that produces `Apr 2025`), and `end` is
  optional, so the current role renders a dangling `–` with nothing after it
  instead of `Present`.
- Impact: the About window is one of six launcher destinations, and the first
  thing in it under the hero is a malformed employment history.
- Recommendation: export `formatDate` from `Resume.tsx` and use it in both
  places; fall back to `Present` when `end` is absent.

**[P1-6] Blog window renders `undefined min read`**
- Location: [src/components/windows/BlogWindow.tsx:24](src/components/windows/BlogWindow.tsx:24)
  — `{formatted} • {post.readingTime} min read`
- `readingTime` is typed `z.string().optional()` in
  [src/content/config.ts:312](src/content/config.ts:312) — a string like
  `"5 min"`, not a number. Rendering it followed by the literal `min read`
  produces `"5 min min read"`, or `"undefined min read"` when the field is
  absent.
- Currently invisible only because there are no posts. It will be visibly broken
  the moment the first one lands.

**[P1-7] Window control buttons are 13 × 13 px**
- Location: [src/styles/os.css:210](src/styles/os.css:210)
- Measured: 13 × 13 px. Taskbar buttons measure 59.8 × 19.5 px.
- WCAG 2.2 §2.5.8 Target Size (Minimum, AA) requires 24 × 24 px. On touch these
  are the only way to close or maximize a window.
- Recommendation: keep the 13 px painted dot, but grow the hit area to ≥24 px
  with padding or a pseudo-element.

**[P1-8] Every visit is gated behind a 2.5-second boot animation**
- Location: [src/components/BootScreen.tsx](src/components/BootScreen.tsx)
- 9 lines × 250 ms + a 400 ms tail ≈ 2.65 s before the desktop fades in over a
  further 0.6 s. There is no skip control, no click-to-dismiss, no
  `sessionStorage` memory, and no `prefers-reduced-motion` path.
- Impact: it is a genuinely nice effect the first time and a tax on every visit
  after. Anyone returning to find your email waits 3 seconds. It also pushes
  meaningful paint past 3 s on the metric that matters for a portfolio link
  clicked from a résumé.
- Recommendation: keep it, but make it skippable (any key or click), remember
  completion for the session, and reduce to a single frame under reduced motion.

**[P1-9] No focus indicators outside desktop icons**
- Location: `src/styles/os.css` — the only `:focus-visible` rule is at
  [line 145](src/styles/os.css:145), on `.os-desktop-icon`
- Window close/minimize/maximize buttons, taskbar buttons, and every link inside
  the content windows have no visible focus state. `.term-input` still sets
  `outline: none`.
- WCAG 2.4.7.

**[P1-10] No live region, no dialog semantics**
- Location: `src/components/Terminal.tsx`, `src/components/OSWindow.tsx`
- `grep -rn "role=\|aria-live" src/components/` returns nothing. Terminal output
  is never announced. Windows are `<div>`s with no `role="dialog"`, no
  `aria-labelledby`, no Escape-to-close, and no focus management on open —
  a screen-reader user has no way to know a window appeared.
- The `sr-only` `<h1>` still reads "Terminal Portfolio" while `<title>` now says
  "Portfolio".

**[P1-11] Zoom disabled**
- Location: [src/pages/index.astro:75](src/pages/index.astro:75) —
  `maximum-scale=1.0, user-scalable=0`, confirmed in `dist/index.html`
- WCAG 1.4.4. Compounds P0-3: 10 px labels at 3–4:1 contrast that cannot be
  zoomed.

**[P1-12] Arrow keys hijacked globally**
- Location: [src/components/Terminal.tsx:88](src/components/Terminal.tsx:88)
- A `window`-level `keydown` handler unconditionally `preventDefault()`s
  ArrowUp/ArrowDown, so arrow-key scrolling is dead across the whole desktop —
  including inside the About and Projects windows, which are scrollable and have
  no other keyboard scroll affordance.

**[P1-13] `og:image` is a relative path**
- Location: [src/pages/index.astro:87](src/pages/index.astro:87); confirmed in
  the build as `content="/headshot-small.jpg"`
- Open Graph requires an absolute URL, so every share renders imageless. The card
  is also declared `summary_large_image` while pointing at a square headshot.

**[P1-14] Windows can be dragged irrecoverably off-screen**
- Location: [src/components/OSWindow.tsx:73](src/components/OSWindow.tsx:73) —
  `onWindowPointerMove` sets `left`/`top` with no clamping
- Drag a window past any edge and it is gone; there is no "reset windows", and
  the taskbar button only re-focuses, it does not reposition. Only a reload
  recovers — which costs another 2.5 s boot (P1-8).

### P2 — minor

**[P2-1] Three different biographies of the same person**
- `src/components/commands/About.tsx` — "I build agents for taxes, audit, and
  accounting at Thomson Reuters… M.S. from NC State"
- `src/components/windows/AboutWindow.tsx:8` — "specializing in agentic systems,
  search, and decision-making…"
- `src/lib/filesystem.ts:88` (`about.txt`) — a third variant, and the only one
  that claims "Location: MSP, MN"
- Three surfaces a visitor can reach in one session, three different stories.
  One should be the source of truth and the other two should import it.

**[P2-2] The stale `tailwind` tag now surfaces in three places**
- `src/content/projects/personal-website.mdx` tags itself `["astro","react","tailwind"]`.
  Tailwind was removed from this project. It renders in the `projects` command,
  the Projects window, and `cat /projects/personal-website.txt`
  ("Stack: astro, react, tailwind"). The same file's body claims "16 Internal
  Commands"; there are 20.

**[P2-3] The blog is dead in five places**
- `src/content/blog/` does not exist. Consequently: the `blog` command prints
  "0 posts", the Blog window renders an empty card list, `/rss.xml` is generated
  empty but advertised in `<head>`, `blog read <slug>` opens `/blog/<slug>/`
  which is not a route, and the filesystem omits `~/blog` entirely.
- The boot screen asserts `[ blog ] OK` while mounting a collection with nothing
  in it.

**[P2-4] Hard-coded window positions overflow smaller laptops**
- Location: [src/components/Desktop.tsx:60](src/components/Desktop.tsx:60) onward
- Windows are placed at fixed pixel offsets up to `left: 500, top: 350` at
  560 × 440. On a 1366 × 768 screen the contact window's bottom edge lands at
  790 px — below the viewport, under the taskbar. Nothing cascades or clamps to
  the actual desktop size.

**[P2-5] `openWindow` / `focusWindow` capture stale `nextZIndex`**
- Location: [src/components/WindowManager.tsx:56](src/components/WindowManager.tsx:56)
- Both read `nextZIndex` from the closure and call `setNextZIndex(z => z + 1)`.
  Two calls in the same tick assign the same z-index. Use a functional update or
  a ref.

**[P2-6] Filesystem commands reject standard flags**
- `ls -la` returns `ls: -la: no such file or directory` — the flag is parsed as a
  path. On a portfolio whose whole conceit is a Unix shell, `ls -la` is the first
  thing a technical visitor will type.

**[P2-7] Colors that escaped the token system**
- `os.css` hard-codes `rgba(255, 255, 255, 0.08 / 0.1 / 0.12)` for every border
  and the macOS traffic-light colors `#ff5f57 / #febc2e / #28c840` for window
  buttons. These do not respond to the theme: white borders sit wrong on amber's
  `#1a1200`, and the traffic lights look imported from another OS in matrix.

**[P2-8] Detector findings**
Both from `os.css`, both verified in context:
- `bounce-easing` — `cubic-bezier(0.34, 1.56, 0.64, 1)` on `window-open`
  ([os.css:162](src/styles/os.css:162)). Overshoot easing reads as dated.
- `layout-transition` — `transition: width` on the boot progress bar
  ([os.css:44](src/styles/os.css:44)). Animate `transform: scaleX()` instead.

**[P2-9] Four type systems in one interface**
IBM Plex Mono (intended body), JetBrains Mono (OS chrome), `system-ui` (window
content, [os.css:328](src/styles/os.css:328)), and Times (accidental, P0-2).
Even after P0-2 is fixed, three remain and no rule says which belongs where.

**[P2-10] `resume highlights` is undiscoverable**
`Resume.tsx` supports `highlights`, but
[src/data/commands.ts:29](src/data/commands.ts:29) lists only `experience` and
`education`, so neither `help` nor tab-completion reveals it. Four entries (Park
Scholar, Critical Language, Cyberclub, Mandarin) are reachable only by guessing.

**[P2-11] Closing the terminal destroys its history**
`Terminal` lives inside `OSWindow`, which returns `null` when closed, unmounting
the component and discarding `cmdHistory`, `navHistory`, and `currentPath`.
Defensible as an OS metaphor; worth a deliberate decision rather than an
accident.

### P3 — polish

- **No 404 page.** `src/pages/` holds only `index.astro` and `rss.xml.js`.
- **`openWindow?: (id: any) => void`** in
  [src/components/termContext.ts:10](src/components/termContext.ts:10) — `any`
  discards the `WindowId` union that exists two files away.
- **Dead `index` field** in `TermContextValue`, still set on every render, still
  read by nothing.
- **`.experience-row` does double duty** as both the wrapper `<div>` and the
  nested `<ul>` in `AboutWindow.tsx`, so the left border and margins apply twice.
- **Unused assets**: `public/fonts/atkinson-*.woff` (nothing references
  Atkinson), `src/assets/headshot-large.jpg`, and five `blog-placeholder-*.jpg`
  used only as `heroImage` values that `index.astro` strips before serialization.
- **Project MDX bodies are still never rendered** — four projects carry real
  written case studies that no surface displays.

### Checked and cleared

Recorded so the next audit does not re-litigate them:

- **`cd` path tracking is correct.** Under realistic timing, `cd /projects` → `ls`
  → `pwd` → `cd ..` → `pwd` all report the right directory, and the prompt path
  matches the command's own working directory. An earlier apparent off-by-one was
  an artifact of driving several commands synchronously in one tick; commit
  `0a56218` fixed the real bug.
- **No horizontal overflow at 375 px.** `scrollWidth === innerWidth === 375`.
- **The mobile icon rail works well** — the horizontally scrolling launcher row
  is a better mobile adaptation than the desktop grid would have been.
- **Theme switching is intact.** `themes set amber` updates `data-theme`,
  `localStorage`, and every token; the pre-paint inline script prevents a flash.

---

## Patterns & systemic issues

1. **Side effects in render bodies.** P0-1 is the acute case, but `Open.tsx` is
   the only command that does not use the `useEffect` pattern its five siblings
   already follow. The convention existed; this one file broke it.
2. **Hooks placed after guards.** `OSWindow` and `Cd` both put early returns
   above their hooks. Neither fires today. Both will.
3. **Content forked instead of shared.** Three bios, two date-formatting
   implementations (one correct, in `Resume.tsx`; one absent, in `AboutWindow`),
   and project data rendered by three surfaces that each re-derive it. The
   redesign added windows without extracting what the terminal already knew.
4. **The redesign moved styles without moving all of them.** The global `body`
   rule was deleted from `terminal.css` and restored only in os.css's mobile
   block. Desktop lost its typography and nobody noticed, because on a phone
   everything looks right.
5. **Accessibility was not part of the redesign.** The new surface added six
   launcher buttons, six draggable windows, and eighteen window-control buttons —
   with one focus style among them, no dialog semantics, no live region, and
   13 px touch targets.

---

## Positive findings

Real strengths, worth protecting through the fixes:

- **The window manager is properly built.** Z-order stacking, focus-on-click,
  minimize/restore via the taskbar, maximize, pointer-capture dragging, and a
  resize handle — all working, in ~260 lines across two files, with no library.
- **The virtual filesystem is a genuinely good idea, well executed.**
  `resolvePath` / `normalizePath` / `getNode` are clean and correctly handle
  `~`, `..`, `.`, absolute and relative paths. It is generated from the same
  content collections that feed the windows, so `cat` never goes stale.
- **Tab-completion now completes filesystem paths**, including directory-aware
  trailing slashes and a shared prefix listing. That is a level of polish most
  terminal portfolios skip.
- **The boot sequence is a strong first impression** — the concept is right, it
  just needs a skip.
- **The mobile adaptation is thoughtful**, not an afterthought: the icon grid
  becomes a scrolling rail, windows go static-flow, dragging and resizing are
  disabled rather than left half-broken.
- **The token system survived the redesign** — four complete themes, one
  `data-theme` attribute, pre-paint restore, no flash.

---

## Recommended commands, in order

1. **[P0] `/impeccable harden`** — the `open` crash, the hooks violations, the
   focus theft, the off-screen drag, `og:image`, a 404 page.
2. **[P0] `/impeccable typeset`** — restore global `body` typography and settle
   which font owns which surface.
3. **[P0] `/impeccable colorize`** — retune `--text-dim` across four themes and
   split out a prose token.
4. **[P1] `/impeccable adapt`** — touch targets, window placement, the mobile
   prompt and banner.
5. **[P1] `/impeccable animate`** — a skippable boot sequence and a
   reduced-motion path.
6. **[P2] `/impeccable distill`** — collapse the three bios; resolve the blog.
7. **`/impeccable polish`** — final pass.

The executable version of all of this is [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

Note: there is still no `PRODUCT.md` or `DESIGN.md`, so this audit read the CSS,
components, and content as the incumbent design authority. Run `/impeccable init`
before any further design work — it is an interview and needs you in the room.
