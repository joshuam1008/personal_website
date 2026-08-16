# Implementation Plan — joshua-mason.com

Executable companion to [AUDIT.md](AUDIT.md).
**Baseline commit:** `0a56218` (main, after the desktop-OS redesign).
**Branch:** `chore/audit-and-plan`.

Every task names the exact file, the exact change, and an acceptance check.
Written to be executed by an agent with no memory of the audit conversation.

---

## How to execute this plan

- **Work phase by phase, in order.** Each phase leaves the site shippable. Do
  not start a phase until the previous phase's verification block passes.
- **After every phase:**
  ```bash
  npm run check && npm run build
  ```
  Both must exit 0. A failure in `astro check` on a content collection means a
  `.mdx` or `.json` file violates its Zod schema — fix the content, not the schema.
- **Manual verification requires a browser.** Several tasks can only be confirmed
  by loading the page. Start the dev server with `npm run dev` and open
  `http://localhost:4321`. Note the 2.5 s boot animation gates the desktop until
  Phase 5 makes it skippable — wait it out before testing.
- **Do not add dependencies.** Everything here uses plain CSS, React, and Astro
  features already installed.
- **Do not reformat files** you are not otherwise editing.
- **Do not touch `CLAUDE.md`.** It is gitignored upstream (see `.gitignore:44`);
  `AGENTS.md` is the tracked agent-instructions file. Task 7.5 updates `AGENTS.md`.
- Commit at the end of each phase, with the phase name in the message.

### Product decisions already made — do not revisit

1. **Blog stays.** The collection, the `blog` command, the Blog window, and the
   RSS feed all remain. The first post is being written. The work is to make the
   empty state honest and build the route so the first post works on the day it
   lands.
2. **Lunar Lander and NBA All-Star Prediction are cut.** Undergraduate work, not
   representative. Delete them; do not add links to them.
3. **The correct email is `joshuam1008@gmail.com`** (as in `src/data/socials.ts`).
   `src/components/commands/Contact.tsx` currently shows
   `joshuamason1008@gmail.com` — that one is wrong and gets fixed in Phase 4.

---

## Phase 1 — Stop the crash, fix the correctness bugs

Goal: no command kills the page, no React rule is violated, no window displays
malformed data. This is the highest value-per-line phase in the plan.

### 1.1 Fix the `open <app>` infinite render loop  ← start here

File: `src/components/commands/Open.tsx`

`openWindow()` is called in the render body. It calls `setState`, which
re-renders this component, whose `rerender` prop is still `true`, which calls it
again — forever. Running `open skills` currently throws
`Maximum update depth exceeded` and wedges the renderer.

Add `useEffect` to the import and move the call into an effect:

```tsx
import { useContext, useEffect } from 'react';
```

Replace the render-body block:

```tsx
// DELETE THIS — side effect during render
if (rerender && arg.length > 0) {
  const appName = arg[0].toLowerCase();
  if (VALID_APPS.includes(appName) && openWindow) {
    openWindow(appName);
  }
}
```

with an effect placed immediately after the `useContext` call, **above** every
conditional return in the component:

```tsx
useEffect(() => {
  if (!rerender || arg.length === 0) return;
  const appName = arg[0].toLowerCase();
  if (VALID_APPS.includes(appName) && openWindow) {
    openWindow(appName);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

This matches the pattern already used by `Themes.tsx`, `Projects.tsx`,
`Socials.tsx`, and `Cd.tsx`.

**Check:** run `open skills`, `open about`, `open projects`, `open contact`,
`open blog`. Each opens the named window exactly once. The browser console is
free of `Maximum update depth exceeded`. Then run `open nonsense` and confirm the
"app not found" error still renders.

### 1.2 Hoist hooks above the guards in `OSWindow`

File: `src/components/OSWindow.tsx`

Four `useState` and five `useRef` calls sit below two early returns
(`if (!wmContext) throw` and `if (!win) return null`). React requires an
unconditional, stable hook order. It does not crash today only because all six
window ids happen to be seeded in the provider.

Reorder the top of the component so **all** hooks run before **any** return:

```tsx
export function OSWindow({ id, title, initialWidth, initialHeight, initialLeft, initialTop, children }: OSWindowProps) {
  const wmContext = useContext(WindowManagerContext);

  const [left, setLeft] = useState(initialLeft);
  const [top, setTop] = useState(initialTop);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const windowRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, startLeft: 0, startTop: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, startW: 0, startH: 0 });

  // Guards come AFTER every hook
  if (!wmContext) throw new Error('OSWindow must be used within WindowManagerProvider');
  const { windows, closeWindow, minimizeWindow, toggleMaximize, focusWindow } = wmContext;
  const win = windows.get(id);
  if (!win) return null;
  if (!win.isOpen) return null;
  // ... rest unchanged
}
```

The event handlers below reference `win`, so they must stay below the guards —
they are plain functions, not hooks, so this is fine.

**Check:** all six windows still open, drag, resize, minimize, maximize, and
close. No console warning about hook order.

### 1.3 Hoist the hook above the guard in `Cd`

File: `src/components/commands/Cd.tsx`

`if (!filesystem) return null;` sits above `useEffect`. Same violation.

Move that guard below the `useEffect`. Because the effect body already reads
`filesystem` indirectly through `isValid`, make it defensive:

```tsx
const node = filesystem ? getNode(filesystem, resolved) : null;
const isValid = !!(node && node.type === 'dir');

useEffect(() => {
  if (isValid && setCurrentPath) setCurrentPath(resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

if (!filesystem) return null;
if (!isValid) { /* existing error branch */ }
```

**Check:** `cd /projects`, `cd ..`, `cd ~`, and `cd nowhere` all behave as before.

### 1.4 Make `neofetch` render all its rows

File: `src/components/commands/Neofetch.tsx`

`LOGO` has 6 entries, `info` has 8, and the render is `LOGO.map(...)`. Rows 6 and
7 — **Stack** and **Uptime** — never render. The 1 Hz `setInterval` updating
`uptime` therefore re-renders forever to display nothing.

Iterate whichever list is longer:

```tsx
const rowCount = Math.max(LOGO.length, info.length);

return (
  <div style={{ fontFamily: 'inherit', lineHeight: '1.6' }}>
    {Array.from({ length: rowCount }, (_, i) => {
      const line = LOGO[i] ?? ' '.repeat(13);   // pad to the logo's width
      const row = info[i];
      return (
        /* existing row markup, using `line` in place of the mapped value */
      );
    })}
  </div>
);
```

Keep the existing `i === 0` / `i === 1` special-casing for the header and
separator rows.

**Check:** `neofetch` output ends with `Stack:` and `Uptime:` rows. Watch the
uptime for a few seconds and confirm it increments.

### 1.5 Fix the About window's dates

Files: `src/components/commands/Resume.tsx`, `src/components/windows/AboutWindow.tsx`

The About window renders `{e.start} – {e.end}`, producing raw ISO strings and a
dangling dash for the current role: `"2025-04 – "`. `Resume.tsx` already has a
`formatDate` helper that produces `Apr 2025`; it is not exported.

1. In `Resume.tsx`, export the existing helper — change
   `function formatDate(iso: string): string {` to
   `export function formatDate(iso: string): string {`. Change nothing else.
2. In `AboutWindow.tsx`, import it and use it in **both** the experience and
   education blocks:
   ```tsx
   import { formatDate } from '@components/commands/Resume';
   ```
   ```tsx
   <div className="exp-date">
     {formatDate(e.start)} – {e.end ? formatDate(e.end) : 'Present'}
   </div>
   ```

**Check:** the About window shows `Apr 2025 – Present` for the current Thomson
Reuters role and `May 2024 – Aug 2024` for the internship. No entry ends in a
bare dash.

### 1.6 Fix the Blog window's reading time

File: `src/components/windows/BlogWindow.tsx`

`readingTime` is `z.string().optional()` — a string like `"5 min"`, not a number.
The template renders `{post.readingTime} min read`, producing `"5 min min read"`
or `"undefined min read"`. Invisible today only because there are no posts.

```tsx
<div style={{ fontSize: '0.75em', color: 'var(--text-dim)', marginBottom: '6px' }}>
  {formatted}
  {post.readingTime ? ` • ${post.readingTime}` : ''}
</div>
```

**Check:** cannot be verified until a post exists. Confirm by reading the code
that no literal `min read` remains and the separator is conditional.

### 1.7 Stop the terminal stealing focus from the whole page

File: `src/components/Terminal.tsx`

A `document`-level click listener refocuses the terminal input on **every** click
anywhere on the page. Verified: clicking the About desktop icon leaves
`document.activeElement.id === 'terminal-input'`. In an OS shell this means
keyboard focus cannot rest on any other window, button, or link.

Delete this effect entirely:

```tsx
useEffect(() => {
  document.addEventListener('click', focusInput);
  return () => document.removeEventListener('click', focusInput);
}, [focusInput]);
```

The terminal root already has an `onClick`. Make it selective and scoped:

```tsx
const handleRootClick = useCallback((e: React.MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.closest('a, button')) return;         // let links and controls work
  if (window.getSelection()?.toString()) return;   // don't destroy a selection
  focusInput();
}, [focusInput]);
```

Wire it: `<div id="terminal-root" onClick={handleRootClick}>`. Keep the
initial-focus effect (`useEffect(() => { focusInput(); }, [])`).

**Check:** click a desktop icon — `document.activeElement` is the icon button,
not `terminal-input`. Click blank space inside the terminal window — the input
focuses. Select terminal output text — the selection survives.

### 1.8 Clamp windows so they cannot be dragged off-screen

File: `src/components/OSWindow.tsx`

`onWindowPointerMove` sets `left`/`top` with no bounds, so a window can be
dragged entirely outside the viewport with no way back — the taskbar button only
re-focuses, it does not reposition.

Clamp in the drag branch, keeping at least the header reachable:

```tsx
const onWindowPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
  if (isDraggingRef.current) {
    const rawLeft = dragStartRef.current.startLeft + (e.clientX - dragStartRef.current.x);
    const rawTop  = dragStartRef.current.startTop  + (e.clientY - dragStartRef.current.y);
    // Keep 120px of the window and its full header on screen
    setLeft(Math.min(Math.max(rawLeft, -width + 120), window.innerWidth - 120));
    setTop(Math.min(Math.max(rawTop, 0), window.innerHeight - 80));
  }
  if (isResizingRef.current) { /* unchanged */ }
};
```

**Check:** drag a window hard toward each edge. It stops with a grabbable strip
still visible, and the header never goes above the top bar.

### 1.9 Fix the stale z-index closure

File: `src/components/WindowManager.tsx`

`openWindow` and `focusWindow` both read `nextZIndex` from the closure while
updating it with `setNextZIndex((z) => z + 1)`. Two calls in the same tick assign
the same z-index.

Track it in a ref so reads and writes cannot diverge:

```tsx
const zCounter = useRef(3);

const openWindow = useCallback((id: WindowId) => {
  const z = ++zCounter.current;
  setWindows((prev) => {
    const updated = new Map(prev);
    const win = updated.get(id);
    if (win) updated.set(id, { ...win, isOpen: true, isMinimized: false, zIndex: z });
    return updated;
  });
}, []);
```

Apply the same shape to `focusWindow`. Delete the `nextZIndex` state and add
`useRef` to the import. Both callbacks now have empty dependency arrays.

**Check:** open all six windows in quick succession; each lands on top of the
previous. Click between them; the clicked one always comes forward and gets the
`.active` ring.

### Phase 1 verification

```bash
npm run check && npm run build
```

- [ ] `open skills` / `about` / `projects` / `blog` / `contact` each open once, no console error
- [ ] Console is clean of `Maximum update depth exceeded`
- [ ] All six windows drag, resize, minimize, maximize, close
- [ ] No window can be lost off-screen
- [ ] `neofetch` shows Stack and a ticking Uptime
- [ ] About window shows `Apr 2025 – Present`
- [ ] Clicking a desktop icon does not move focus to the terminal input

---

## Phase 2 — Restore desktop typography

Goal: the terminal renders in a monospace font again.

### 2.1 Restore the global `body` rule

File: `src/styles/terminal.css`

The redesign deleted the global `body` rule and replaced it with
`#terminal-root { -webkit-font-smoothing: antialiased; }`. On desktop, `body`
now computes to `font-family: Times`, `color: rgb(0,0,0)`,
`background: rgba(0,0,0,0)`. The terminal prompt, output, and input all inherit
Times. The ASCII banner survives only because `<pre>` carries a UA monospace
default. Mobile looks correct because `os.css` re-declares the rule inside its
`max-width: 640px` block — which is why this is easy to miss.

Restore it immediately after the reset block:

```css
html, body {
  width: 100%;
  min-height: 100%;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

Keep the existing `#terminal-root` rule; drop the now-redundant
`-webkit-font-smoothing` declaration from it.

Do **not** restore `overflow: hidden` on `html, body` — the OS shell manages its
own layout via `.os-desktop-env { height: 100vh }`, and Phase 6 adds scrolling
content routes that need the page to scroll.

### 2.2 Delete the duplicate mobile declaration

File: `src/styles/os.css`

Inside `@media (max-width: 640px)`, remove the whole `body { ... }` block
(background, color, font-family, font-size, line-height). It is now dead
duplication of 2.1 and will silently mask any future regression of the same kind.

**Check** (both tasks), in the browser console at ≥1024 px wide:

```js
const b = getComputedStyle(document.body);
console.log(b.fontFamily, b.color, b.backgroundColor, b.fontSize);
```

Must report `IBM Plex Mono` (not `Times`), the theme's `--text` color, the
theme's `--bg` background, and `15px`. Then confirm
`getComputedStyle(document.querySelector('.term-prompt')).fontFamily` also
contains `IBM Plex Mono`.

### 2.3 Write down which font owns which surface

File: `src/styles/os.css`, as a comment at the top of the file.

There are now three intentional families — IBM Plex Mono (terminal and body),
JetBrains Mono (OS chrome: top bar, window titles, taskbar, card titles), and
`system-ui` (window body content, `os.css:328`). That is defensible, but nothing
records the rule, which is how the fourth one crept in. Add:

```css
/* Type system:
   - IBM Plex Mono  — body default, terminal, anything shell-like
   - JetBrains Mono — OS chrome only: top bar, window titles, taskbar, card titles
   - system-ui      — window body content (.info-window-body), for readable prose
   Do not introduce a fourth. Do not let anything inherit an unset family. */
```

**Check:** comment present; no code change.

### Phase 2 verification

- [ ] Desktop terminal renders in IBM Plex Mono, not Times
- [ ] `body` background matches the theme in all four themes
- [ ] Mobile is visually unchanged from before this phase
- [ ] The ASCII banner still aligns correctly

---

## Phase 3 — Accessibility

Goal: WCAG AA on contrast, focus, target size, zoom, and motion.

### 3.1 Retune the color tokens

File: `src/styles/terminal.css`

`--text-dim` fails AA in all four themes, measured both as OS chrome (no overlay)
and inside the terminal (where `#terminal-root::after` composites ~50 % coverage
of `var(--scanline)` over everything):

| Theme | chrome | terminal | both fail 4.5:1 |
|---|---|---|---|
| green | 4.12 | 3.57 | ✗ |
| amber | 3.51 | 3.04 | ✗ |
| dracula | 3.03 | 2.83 | ✗ |
| matrix | 3.80 | 3.11 | ✗ |

The values below were solved against the **stricter** (with-overlay) case, so one
value works in both contexts. A second token, `--text-secondary`, clears 7:1 and
takes over prose; `--text-dim` is demoted to true metadata only.

In each theme block, replace the `--text-dim` line and add `--text-secondary`
directly beneath it:

| Theme | `--text-dim` (old → new) | `--text-secondary` (new) |
|---|---|---|
| `green` / `:root` | `#6e7681` → `#838991` | `#a6adb5` |
| `amber` | `#7a6a44` → `#978a6b` | `#bcae8b` |
| `dracula` | `#6272a4` → `#8297d9` | `#a3bdff` |
| `matrix` | `#007a1f` → `#009d28` | `#00c632` |

Resulting ratios: `--text-dim` 4.60–4.61:1 with the overlay and 5.00–5.82:1
without; `--text-secondary` 7.00–7.01:1 with the overlay. **Do not round these
hex values** — they sit just above the threshold deliberately.

Add the class next to the existing `.term-dim` rule:

```css
.term-body { color: var(--text-secondary); }
```

### 3.2 Move prose off the metadata color

`--text-dim` is doing four different jobs. Switch these specific usages to the
new token; leave everything else on `--text-dim`.

In `src/styles/os.css`:

| Selector | Change |
|---|---|
| `.os-desktop-icon .icon-label` | `color: var(--text-secondary)` — these are the primary navigation labels |
| `.experience-row li` | `color: var(--text-secondary)` — résumé bullets are prose |
| `.info-hero p` | `color: var(--text-secondary)` |

In these components, the inline `color: 'var(--text-dim)'` on body-copy
paragraphs becomes `var(--text-secondary)`:

- `src/components/windows/AboutWindow.tsx` — the About paragraph
- `src/components/windows/ProjectsWindow.tsx` — the project summary `<p>`
- `src/components/windows/BlogWindow.tsx` — the post description `<p>`

In these terminal commands, `className="term-dim"` becomes `className="term-body"`:

| File | What |
|---|---|
| `commands/Welcome.tsx` | the "Click desktop icons or type help…" paragraph |
| `commands/About.tsx` | the closing "Try: resume · projects · …" line |
| `commands/Contact.tsx` | the closing "I typically respond within a day or two…" paragraph |
| `commands/Help.tsx` | `<span className="term-dim">{desc}</span>` — the command descriptions |
| `commands/Resume.tsx` | the highlight bullet `<div>`s in the `showHlt` block |
| `commands/Projects.tsx` | the "N projects. Use projects go <n>…" intro, plus the usage lines in both error branches |
| `commands/Blog.tsx` | the intro line, plus the usage lines in the error branches |
| `commands/Socials.tsx` | the "Find me online…" intro, plus the error-branch usage line |
| `commands/Themes.tsx` | the "Available themes…" intro, plus the `{t.label}` spans |
| `commands/Cat.tsx` | the file-content lines — `cat` output is the file's prose |

**Leave on `--text-dim`:** `.term-cmd-echo`, dates, `#tags`, `slug:` labels,
`.term-resume-meta`, `.exp-date`, `.os-window-title`, `.tray-label`, prompt path,
and the `•`/`›` bullet markers.

**Check:** sample each theme with a contrast checker. No paragraph of full
sentences remains on `--text-dim`.

### 3.3 Focus indicators

File: `src/styles/os.css`

The only `:focus-visible` rule in the codebase is on `.os-desktop-icon`. Window
controls, taskbar buttons, and every link inside content windows have none.

```css
/* ── Focus ────────────────────────────────────────────────── */
.os-window-btn:focus-visible,
.os-taskbar-btn:focus-visible,
.info-window-body a:focus-visible,
.contact-row a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 3px;
}
```

File: `src/styles/terminal.css`

```css
a.term-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

/* The input is borderless; ring the prompt row instead */
.term-input-row:focus-within {
  outline: 1px solid var(--accent);
  outline-offset: 4px;
  border-radius: 2px;
}
```

Leave `outline: none` on `.term-input` itself — `:focus-within` on the row is the
visible indicator and reads better with the prompt.

**Check:** tab through the page from a fresh load. Every stop is visible.

### 3.4 Enlarge the window-control hit areas

File: `src/styles/os.css`

`.os-window-btn` measures 13 × 13 px. WCAG 2.2 §2.5.8 (AA) requires 24 × 24. On
touch these are the only way to close or maximize a window.

Keep the 13 px painted dot; grow the target with a pseudo-element:

```css
.os-window-btn {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: filter 0.15s ease;
  position: relative;
}

/* Invisible 24x24 hit area, centred on the dot (WCAG 2.5.8) */
.os-window-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}
```

The header's `.os-window-actions { gap: 8px }` means 13 + 8 = 21 px of pitch, so
24 px targets will overlap slightly. Raise that gap to `12px` so each target is
cleanly separated.

Also raise the taskbar buttons (measured 59.8 × 19.5 px) to at least 24 px tall:

```css
.os-taskbar-btn { padding: 6px 10px; min-height: 24px; }
```

**Check:** measure in the console —
`document.querySelector('.os-window-btn').getBoundingClientRect()` still reports
13 px (the dot), but clicking 10 px away from the dot's centre still activates it.

### 3.5 Re-enable zoom

File: `src/pages/index.astro`

```astro
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

The removed `maximum-scale=1.0, user-scalable=0` was presumably guarding against
iOS focus auto-zoom, which `.term-input { font-size: 16px }` in the mobile block
already handles.

**Check:** pinch-zoom works in device emulation.

### 3.6 Stop hijacking the arrow keys

File: `src/components/Terminal.tsx`

Delete this whole effect:

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

It is a `window`-level listener that kills arrow-key scrolling across the entire
desktop — including inside the About and Projects windows, which scroll and have
no other keyboard affordance. Its real purpose belongs in the input's own
handler: add `e.preventDefault();` as the first statement inside **both** the
`ArrowUp` and `ArrowDown` branches of `handleKeyDown`.

**Check:** `↑`/`↓` still recall history when the input is focused; arrow keys
scroll the About window when it is focused.

### 3.7 Live region and landmarks

File: `src/components/Terminal.tsx`

Wrap the rendered history in a live region so screen readers announce command
output. Add no styles — it must not affect layout.

```tsx
<div role="log" aria-live="polite" aria-relevant="additions text">
  {cmdHistory.map((entry, index) => { /* unchanged */ })}
</div>
```

File: `src/components/OSWindow.tsx`

Give windows dialog semantics and a label:

```tsx
<div
  ref={windowRef}
  className={className}
  role="dialog"
  aria-label={title}
  ...
>
```

File: `src/pages/index.astro`

The `sr-only` `<h1>` reads "Joshua Mason — Terminal Portfolio" while `<title>`
now says "Joshua Mason — Portfolio". Make the `<h1>` match the `title` constant.

**Check:** `document.querySelector('[role=log]')` exists and wraps the history;
each window reports `role="dialog"` with a matching `aria-label`; layout is
visually unchanged.

### 3.8 Respect reduced motion

File: `src/styles/os.css`, appended at the end:

```css
@media (prefers-reduced-motion: reduce) {
  .os-window { animation: none; }
  .os-desktop-env,
  #os-boot-screen { transition: none; }
  .os-taskbar-btn:hover { transform: none; }
  .boot-progress span { transition: none; }
}
```

File: `src/styles/terminal.css`, appended at the end:

```css
@media (prefers-reduced-motion: reduce) {
  .term-cursor { animation: none; opacity: 1; }
  #terminal-root { scroll-behavior: auto; }
}
```

File: `src/components/Terminal.tsx` — the auto-scroll effect must agree:

```tsx
useEffect(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  bottomRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}, [cmdHistory]);
```

Do **not** add a blanket `* { animation: none !important }` — each of these needs
a working alternative, not deletion. The boot screen gets its own reduced-motion
handling in Phase 5.

**Check:** with reduced motion enabled, windows appear without the scale-in,
the cursor holds solid, and terminal scrolling jumps.

### 3.9 Replace the bounce easing

File: `src/styles/os.css:162`

The impeccable detector flags `cubic-bezier(0.34, 1.56, 0.64, 1)` on
`window-open` — overshoot easing reads as dated. Use an ease-out-quart:

```css
animation: window-open 0.22s cubic-bezier(0.25, 1, 0.5, 1);
```

Also at `os.css:44`, the boot progress bar animates `width`, which thrashes
layout. Switch to a transform:

```css
.boot-progress span {
  display: block;
  height: 100%;
  width: 100%;
  transform-origin: left;
  transform: scaleX(0);
  background: var(--accent);
  transition: transform 0.3s ease;
}
```

and in `src/components/BootScreen.tsx` change the inline style from
`style={{ width: `${progress}%` }}` to
`style={{ transform: `scaleX(${progress / 100})` }}`.

**Check:** re-run the detector (task 7.4); both findings clear.

### Phase 3 verification

```bash
npm run check && npm run build
```

- [ ] All four themes: `--text-dim` ≥4.5:1 and `--text-secondary` ≥7:1 against their own background
- [ ] Desktop icon labels are legible in every theme
- [ ] Every focusable element shows a ring
- [ ] Window buttons are clickable from ≥12 px off-centre
- [ ] Pinch-zoom works
- [ ] Arrow keys scroll the About window
- [ ] `[role=log]` present; windows are `role="dialog"` with labels
- [ ] Reduced motion: no window scale-in, solid cursor, instant scroll

---

## Phase 4 — Content truth

Goal: nothing the site says about itself is false, and no reachable path
dead-ends.

### 4.1 Fix the wrong email

File: `src/components/commands/Contact.tsx`

Two addresses ship today. `src/data/socials.ts` has the correct one. Change both
the `href` and the link text:

```tsx
<a className="term-link" href="mailto:joshuam1008@gmail.com">
  joshuam1008@gmail.com
</a>
```

**Check:** `grep -rn "joshuamason1008" src/` returns nothing.

### 4.2 Delete the two undergraduate projects

```bash
rm -f src/content/projects/lunar-lander.mdx
rm -f src/content/projects/nba-all-star-prediction.mdx
```

Four projects remain, all with a `Source` link — which also removes the
`projects go <n>` "No public repository available" dead end at no extra cost.

**Check:** `ls src/content/projects/` lists exactly four files. In the browser,
`projects` lists four, the Projects window shows four cards, and
`ls /projects` lists four `.txt` files.

### 4.3 Fix the self-describing project entry

File: `src/content/projects/personal-website.mdx`

- `tags`: `["astro", "react", "tailwind"]` → `["astro", "react", "typescript"]`.
  Tailwind was removed from this project (see the comment in `astro.config.mjs`).
  The stale tag currently surfaces in three places: the `projects` command, the
  Projects window, and `cat /projects/personal-website.txt`.
- Body: "16 Internal Commands" → **20**. Verify against `src/data/commands.ts`
  before writing the number.
- The body still describes the site as a terminal, not a desktop OS. Rewrite the
  opening paragraph and the feature list to describe what it actually is now:
  a simulated desktop with a window manager, a virtual filesystem, and a terminal
  as one of six apps.
- Delete the `heroImage` / `heroImageAlt` lines — they point at
  `blog-placeholder-4.jpg`, which is stock placeholder art, and `index.astro`
  strips `heroImage` before serialization so it renders nowhere.

Check for the same placeholder pattern elsewhere:

```bash
grep -ln "blog-placeholder" src/content/projects/*.mdx
```

Remove those `heroImage` lines too.

**Check:** `grep -rn "tailwind\|16 Internal" src/content/` returns nothing.

### 4.4 Collapse the three biographies

Three different bios ship simultaneously:

- `src/components/commands/About.tsx` — "I build agents for taxes, audit, and
  accounting at Thomson Reuters… M.S. from NC State"
- `src/components/windows/AboutWindow.tsx:8` — "specializing in agentic systems,
  search, and decision-making…"
- `src/lib/filesystem.ts:88` (`about.txt`) — a third variant, the only one
  claiming "Location: MSP, MN"

Create `src/data/bio.ts` as the single source of truth:

```ts
export const BIO = {
  name: 'Joshua Mason',
  role: 'Applied Scientist & AI Engineer',
  location: 'MSP, MN',
  /** One-paragraph summary. Used by the About window and about.txt. */
  summary:
    "I build agents for taxes, audit, and accounting at Thomson Reuters. " +
    "My work spans RAG architectures, ReACT flows, agentic search, coding agents, " +
    "OTEL observability, and evaluation frameworks including human-in-the-loop " +
    "annotation to guarantee answer quality and structural guardrails.",
  education: 'M.S. in Computer Science, NC State',
} as const;
```

Then:
- `AboutWindow.tsx` — replace the local `aboutText` constant with `BIO.summary`,
  and the hero's hard-coded name/role with `BIO.name` / `BIO.role`.
- `filesystem.ts` — build `aboutContent` from `BIO` instead of its own array.
- `About.tsx` — keep the richer JSX formatting (the accent spans are worth
  keeping), but make the factual claims match `BIO`. If they diverge later, the
  constant wins.

Use the About command's copy as the canonical text — it is the most specific and
the only one that names the actual domain.

**Check:** the `about` command, the About window, and `cat ~/about.txt` all tell
the same story. `grep -rn "agentic systems, search, and decision-making" src/`
returns nothing.

### 4.5 Make `blog` honest, and build its route

**Empty state** — `src/components/commands/Blog.tsx`. Today an empty collection
renders "0 posts. Use `blog read <slug>` to open one", which reads like a bug.
Before the default list return:

```tsx
if (blog.length === 0) {
  return (
    <div data-testid="blog">
      <p>No posts published yet.</p>
      <p className="term-body" style={{ marginTop: '0.5rem' }}>
        The first one is being written. Until then,{' '}
        <span className="term-accent3">projects</span> has write-ups of what I've
        built and <span className="term-accent3">contact</span> is the fastest
        way to reach me.
      </p>
    </div>
  );
}
```

Also guard the "Available slugs:" lists in the `blog read` no-slug and not-found
branches with `blog.length > 0 &&` — they currently render a header with nothing
under it.

**Empty state** — `src/components/windows/BlogWindow.tsx`. It currently maps an
empty array and renders a blank window. Add the same message in an `.info-card`.

**Dead-tab guard** — `src/components/commands/Blog.tsx`. The `useEffect` opens
`/blog/<slug>/` for any slug argument, before the component checks whether the
post exists, so `blog read nonsense` opens a 404 tab *and* prints "Post not
found":

```tsx
useEffect(() => {
  if (!rerender || subCmd !== 'read' || !slugArg) return;
  if (!blog.some((p) => p.slug === slugArg)) return;   // ← added
  window.open(`/blog/${slugArg}/`, '_blank');
}, [rerender]);
```

**The route** — new file `src/pages/blog/[slug].astro`. The path `blog read`
links to does not exist. Build it now so the first post works the day it lands;
with an empty collection `getStaticPaths` returns `[]` and Astro emits nothing,
so this is safe to add early.

```astro
---
import { getCollection } from 'astro:content';
import '@styles/terminal.css';

export async function getStaticPaths() {
  const posts = (await getCollection('blog')).filter((p) => !p.data.draft);
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{post.data.title} — Joshua Mason</title>
    <meta name="description" content={post.data.description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" />
    <script is:inline>
      (function () {
        var saved = localStorage.getItem('terminal-theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);
      })();
    </script>
  </head>
  <body>
    <main class="term-page">
      <p><a class="term-link" href="/">← back to desktop</a></p>
      <h1>{post.data.title}</h1>
      <p class="term-body">{post.data.description}</p>
      <p class="term-dim">
        {post.data.pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        {post.data.readingTime ? ` · ${post.data.readingTime}` : ''}
      </p>
      <article class="term-prose"><Content /></article>
    </main>
  </body>
</html>
```

`.term-page` and `.term-prose` are defined in task 4.7.

**Boot screen honesty** — `src/components/BootScreen.tsx` asserts
`[ blog ] OK` while mounting an empty collection. Leave the line (it is set
dressing, and the collection genuinely does mount), but if the blog is still
empty when this ships, consider `[ blog ] 0 posts` for the joke.

**Check:** `blog` shows the coming-soon copy; the Blog window shows a message
rather than an empty pane; `blog read nonsense` opens no tab; the build emits no
`/blog/*` pages and does not error.

### 4.6 Build the project case-study route

New file: `src/pages/projects/[slug].astro`

Four project `.mdx` files contain written case studies that no surface renders.
This route surfaces them and doubles as crawlable content (Phase 6 depends on it).

Structure it exactly like `src/pages/blog/[slug].astro`, with these differences:

- `getStaticPaths` reads the `projects` collection, no `draft` filter.
- `<title>{post.data.title} — Joshua Mason</title>`, description from
  `post.data.summary`.
- Under the description, render `post.data.tags` and the `post.data.links` array
  as `<a class="term-link">` elements.
- Replace the date line with
  `Launched {post.data.launchedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`.

Then link to it from the two list surfaces:

- `src/components/commands/Projects.tsx` — in the default list branch, inside the
  `<div style={{ marginTop: '0.15rem' }}>` that maps `p.links`, add **before**
  the mapped links:
  ```tsx
  <a className="term-link" href={`/projects/${p.slug}`} style={{ marginRight: '1rem' }}>
    Case study →
  </a>
  ```
  Note the arrow: `→` for internal, the existing `↗` for external.
- `src/components/windows/ProjectsWindow.tsx` — add the same link ahead of the
  mapped `p.links` in each card.

**Check:** the build emits four pages under `dist/projects/`; each shows its MDX
body prose; both list surfaces link to them.

### 4.7 Add the page styles the two routes need

File: `src/styles/terminal.css`, appended before the `@media (max-width: 640px)` block:

```css
/* ── Standalone content pages (blog posts, project case studies) ── */
.term-page {
  max-width: 76ch;
  margin: 0 auto;
  padding: 2rem 1.5rem 6rem;
}
.term-page h1 {
  color: var(--accent2);
  font-size: 1.5rem;
  margin: 0.75rem 0 0.25rem;
}
.term-prose { margin-top: 1.5rem; }
.term-prose h2 { color: var(--accent3); font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
.term-prose h3 { color: var(--accent3); font-size: 1rem;   margin: 1.25rem 0 0.5rem; }
.term-prose p  { margin-bottom: 0.85rem; }
.term-prose ul, .term-prose ol { margin: 0 0 0.85rem 1.25rem; }
.term-prose li { margin-bottom: 0.3rem; }
.term-prose code { background: var(--surface); padding: 0.1em 0.35em; border-radius: 3px; }
.term-prose pre {
  background: var(--surface);
  padding: 0.85rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 0.85rem;
}
.term-prose a { color: var(--link); }
```

These pages need the body to scroll — Phase 2 already avoided restoring
`overflow: hidden`, so nothing further is required. Verify it.

### 4.8 Make `resume highlights` discoverable

File: `src/data/commands.ts`

`Resume.tsx` supports `highlights`, but the registry lists only two
sub-commands, so neither `help` nor tab-completion reveals it and four entries
(Park Scholar, Critical Language, Cyberclub, Mandarin) are reachable only by
guessing.

```ts
{ cmd: 'resume',   desc: 'work history  — try: resume | resume experience | resume education | resume highlights', subCommands: ['experience', 'education', 'highlights'] },
```

**Check:** `resume ` + Tab offers three sub-commands; `resume highlights` renders
the four entries.

### 4.9 Absolute `og:image` and a real OG card

File: `src/pages/index.astro`

`og:image` is `/headshot-small.jpg` — a relative path, which Open Graph does not
accept, so every share renders imageless. It is also square while the card is
declared `summary_large_image`.

1. Produce `public/og.png` at exactly **1200 × 630**. Preferred: run the dev
   server, size the viewport to 1200 × 630, load the page, let the boot finish,
   and screenshot the desktop with the terminal window open — that image *is* the
   pitch. If you cannot capture one, skip to step 2 keeping
   `/headshot-small.jpg` as the path; do not ship a stretched or letterboxed image.
2. Make the URL absolute:
   ```astro
   const ogImage = new URL('/og.png', Astro.site).href;
   ```
3. Add the tags that are missing:
   ```astro
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta property="og:image:alt" content="A simulated desktop OS portfolio with a terminal window open" />
   ```

Also update the page description — it still says "Interactive desktop portfolio"
which is fine, but the `sr-only` `<h1>` fixed in 3.7 should agree with it.

**Check:** `grep 'og:image"' dist/index.html` shows a full `https://` URL.

### 4.10 Add a 404 page

New file: `src/pages/404.astro`

Bad paths currently fall through to the GitHub Pages default, which breaks the
illusion. Reuse `.term-page` from 4.7 and the same theme-restore inline script:

```astro
<main class="term-page">
  <pre class="term-accent">404</pre>
  <p><span class="term-error">bash: no such file or directory</span></p>
  <p class="term-body" style="margin-top:0.75rem">
    That path does not exist. Everything lives on the desktop.
  </p>
  <p style="margin-top:1rem"><a class="term-link" href="/">← back to desktop</a></p>
</main>
```

**Check:** `dist/404.html` exists.

### Phase 4 verification

```bash
npm run check && npm run build
```

- [ ] `grep -rn "joshuamason1008" src/` returns nothing
- [ ] Four projects everywhere: `projects`, Projects window, `ls /projects`
- [ ] `grep -rn "tailwind\|16 Internal" src/content/` returns nothing
- [ ] `about`, About window, and `cat ~/about.txt` agree
- [ ] `blog` and the Blog window both show coming-soon copy
- [ ] `blog read nonsense` opens no tab
- [ ] `dist/projects/` has four pages with case-study prose
- [ ] `dist/404.html` exists
- [ ] `resume highlights` works and Tab-completes
- [ ] `og:image` is absolute

---

## Phase 5 — Boot sequence and responsive polish

### 5.1 Make the boot screen skippable

File: `src/components/BootScreen.tsx`

Nine lines × 250 ms + a 400 ms tail ≈ 2.65 s, then a 0.6 s fade — on **every**
visit, with no skip, no memory, and no reduced-motion path. It is a good effect
the first time and a tax afterwards.

Three changes:

1. **Skip on any key or click.** Add a `finish` callback that clears both
   intervals, fills the line list, and calls `onComplete()`; bind it to
   `keydown` and `pointerdown` on `window` for the life of the boot screen.
   Render a hint — `press any key to skip` — in `--text-dim` beneath the
   progress bar.
2. **Remember completion for the session.** On mount, if
   `sessionStorage.getItem('boot-complete')` is set, call `onComplete()`
   immediately and render nothing. Set the key when the boot finishes. Use
   `sessionStorage`, not `localStorage` — a first-time visitor in a new session
   should still see it.
3. **Reduced motion.** If
   `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, render all
   lines at once and complete after ~300 ms.

Guard `sessionStorage` access in a `try/catch` — it throws in Safari private
mode and would take the whole desktop down with it.

**Check:** reload — boot plays. Press a key mid-boot — it completes immediately.
Reload again in the same tab — the desktop appears at once. Open a new tab —
boot plays again. With reduced motion on, no line-by-line animation.

### 5.2 Cascade window positions from the viewport

File: `src/components/Desktop.tsx`

Windows use fixed pixel offsets up to `left: 500, top: 350` at 560 × 440. On a
1366 × 768 screen the contact window's bottom edge lands at 790 px — below the
viewport, under the taskbar.

Replace the six hard-coded pairs with a computed cascade. Keep it simple — a
helper in `Desktop.tsx` that takes an index and returns clamped coordinates:

```tsx
function cascade(index: number, w: number, h: number) {
  const availW = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const availH = typeof window !== 'undefined' ? window.innerHeight : 900;
  const step = 32;
  return {
    left: Math.max(16, Math.min(120 + index * step, availW - w - 16)),
    top:  Math.max(16, Math.min(64  + index * step, availH - h - 100)), // 100 = both bars
  };
}
```

`OSWindow` reads `initialLeft`/`initialTop` into `useState` once, so this is
evaluated at mount and does not need to react to resize. The Phase 1.8 clamp
handles the rest.

Keep the terminal window larger (820 × 520) and first in the cascade — it should
still be the obvious focus on load.

**Check:** at 1366 × 768 and 1280 × 800, open all six windows. Every one is fully
on-screen with its header reachable.

### 5.3 Fix the mobile prompt

Files: `src/components/TermPrompt.tsx`, `src/styles/terminal.css`

At 375 px the prompt renders `visitor$` — the mobile block hides `.prompt-host`,
`.prompt-path`, and `.prompt-at` but leaves `.prompt-user`. The component's own
doc comment says mobile should show `~$`.

The path segment currently bundles the colon: `<span className="prompt-path">:{displayPath}</span>`.
Split it so mobile can drop the colon but keep the path:

```tsx
<span className="prompt-user">visitor</span>
<span className="prompt-at">@</span>
<span className="prompt-host">joshua-mason</span>
<span className="prompt-colon">:</span>
<span className="prompt-path">{displayPath}</span>
<span className="prompt-dollar">$ </span>
```

Add `.prompt-colon { color: var(--text-dim); }` beside the other prompt-part
rules, and in the mobile block hide only what should go:

```css
.prompt-user,
.prompt-at,
.prompt-host,
.prompt-colon { display: none; }
```

Leaving `.prompt-path` and `.prompt-dollar` visible yields `~$` at home and
`/projects$` after a `cd` — which is more useful than the old static `~`.

**Check:** at 375 px the prompt reads `~$`; after `cd /projects` it reads
`/projects$`. At desktop width it is unchanged.

### 5.4 Rebuild the mobile ASCII banner

File: `src/components/commands/Welcome.tsx`, constant `BANNER_MOBILE`

Two problems, both visible at 375 px: four blank filler lines leave a large dead
gap between JOSHUA and MASON, and the MASON block is indented ~12 spaces so the
two words do not align.

- Delete the four blank lines between the two words.
- Dedent every line of the MASON block by exactly 12 spaces.
- Delete the trailing whitespace-only line at the end.
- **Change nothing else.** Do not retype the glyphs and do not touch any
  backslash escape — edit by deleting characters only. The string is a template
  literal with escaped backslashes and backticks; retyping it will corrupt it.

**Check:** at 375 px both words are left-aligned with at most one blank line
between them, and there is no horizontal scrollbar.

### 5.5 Teach the filesystem commands about flags

Files: `src/components/commands/Ls.tsx`, `Cat.tsx`

`ls -la` currently returns `ls: -la: no such file or directory` — the flag is
parsed as a path. On a portfolio whose entire conceit is a Unix shell, `ls -la`
is among the first things a technical visitor types.

In `Ls.tsx`, filter leading-dash tokens out before resolving the target:

```tsx
const args = arg.filter((a) => !a.startsWith('-'));
const targetRaw = args[0] ?? currentPath;
```

Do not implement `-l` long-format output — just stop flags from breaking the
command. Apply the same filter in `Cat.tsx`.

**Check:** `ls -la`, `ls -l /projects`, and `ls` all list the same entries.

### 5.6 Sweep every command at 375 px

The audit checked the welcome screen at mobile width, not the long outputs. Run
all 20 commands at 375 px and look for horizontal overflow, broken grids, and
truncation. Pay particular attention to:

- `resume` — `.term-resume-entry` has a left border and padding; check bullets wrap
- `skills` — `.term-skills-row` collapses to one column; confirm the category still reads as a label
- `neofetch` — the ASCII logo plus a value column is the widest fixed-width output
- `projects` — long summaries and the tag row
- `help` — 20 rows against a `10ch` first column; the longest name is `neofetch` (8)
- `ls /projects` — long slugs in a wrapping flex row

Fix what breaks. Nothing here is expected to need a large change; if something
does, note it and raise it rather than redesigning on the spot.

**Check:** after every command,
`document.documentElement.scrollWidth <= window.innerWidth`.

### Phase 5 verification

- [ ] Boot skips on keypress and is remembered for the session
- [ ] All six windows fit on a 1366 × 768 screen
- [ ] Mobile prompt reads `~$`, and tracks `cd`
- [ ] Mobile banner is aligned, no dead gap
- [ ] `ls -la` works
- [ ] No horizontal overflow on any command at 375 px

---

## Phase 6 — Crawlable content

Goal: the site has indexable text. Phase 4.6's `/projects/<slug>` routes did most
of the work; this closes the gap on the landing page.

### 6.1 Add a `<noscript>` fallback

File: `src/pages/index.astro`

The built `dist/index.html` body contains exactly one hidden `<h1>` and nothing
else — the whole site is drawn client-side by a `client:only` island. Crawlers
that do not execute JS index nothing, and (until Phase 2) a JS-disabled visitor
got a white screen.

Full SSR of the desktop is a rewrite and is **not** proposed. This is the 90/10:
render the same collection data the island already receives. It is in scope in
the frontmatter.

Immediately after the `sr-only` `<h1>`:

```astro
<noscript>
  <div class="noscript-fallback">
    <h2>Joshua Mason — Applied Scientist &amp; AI Engineer</h2>
    <p>
      I build agents for taxes, audit, and accounting at Thomson Reuters. My work
      spans RAG architectures, ReACT flows, agentic search, coding agents, OTEL
      observability, and evaluation frameworks including human-in-the-loop
      annotation. M.S. in Computer Science, NC State.
    </p>

    <h3>Projects</h3>
    <ul>
      {projects.map((p) => (
        <li><a href={`/projects/${p.slug}`}>{p.title}</a> — {p.summary}</li>
      ))}
    </ul>

    <h3>Experience</h3>
    <ul>
      {resume.filter((e) => e.section === 'experience').map((e) => (
        <li>{e.title}, {e.organization} ({e.start}–{e.end ?? 'Present'})</li>
      ))}
    </ul>

    <h3>Contact</h3>
    <ul>
      <li><a href="mailto:joshuam1008@gmail.com">joshuam1008@gmail.com</a></li>
      <li><a href="https://github.com/joshuam1008">GitHub</a></li>
      <li><a href="https://www.linkedin.com/in/joshuam1008/">LinkedIn</a></li>
      <li><a href="/Joshua-Mason-Resume.pdf">Resume (PDF)</a></li>
    </ul>
  </div>
</noscript>
```

Style `.noscript-fallback` in the page's `<style>` block reusing the
`.term-page` measure and colors. Keep the summary paragraph in sync with
`BIO.summary` from task 4.4 — ideally interpolate `{BIO.summary}` rather than
duplicating the text a fourth time.

**Check:**
```bash
npm run build && grep -c "noscript-fallback" dist/index.html
```
returns ≥1, and the project titles appear in the built HTML.

### 6.2 Verify the sitemap picked up the new routes

```bash
npm run build && cat dist/sitemap-0.xml
```

Should list `/` plus `/projects/<slug>` for all four projects. `@astrojs/sitemap`
is already configured and does this automatically — this is a verification step,
not a change. If the project pages are missing, the routes are not building.

### Phase 6 verification

- [ ] `dist/index.html` contains the fallback text and the four project titles
- [ ] `dist/sitemap-0.xml` lists five URLs
- [ ] With JS disabled, the page shows readable content on a themed background

---

## Phase 7 — Cleanup and documentation

Pure deletion and record-keeping. No behavior changes.

### 7.1 Delete unused assets

```bash
grep -rin atkinson src/ public/    # must return nothing first
rm -f public/fonts/atkinson-bold.woff public/fonts/atkinson-regular.woff
rmdir public/fonts
rm -f src/assets/headshot-large.jpg
```

Then check the placeholders now that task 4.3 removed their referrers:

```bash
grep -rn "blog-placeholder" src/ || echo "safe to delete all placeholders"
```

Delete any with no remaining referrer.

### 7.2 Delete dead code

| File | What | Why |
|---|---|---|
| `src/components/termContext.ts` | the `index: number` field, from both the type and the default value | Set on every render, read by nothing — `grep -rn "index" src/components/commands/` is empty |
| `src/components/Terminal.tsx` | the `index` entry in `contextValue` and the unused `index` param in the `.map()` callback | Follows from the above |
| `src/components/termContext.ts` | `openWindow?: (id: any) => void` → `(id: WindowId) => void` | `any` discards the union defined two files away; import the type |
| `src/components/Terminal.tsx` | the dead second clause in the Tab handler, `(!inputVal && tokens.length === 1)` | `tokens` derives from `inputVal`; if `inputVal` is empty then `tokens.length` is 0, so this is unreachable |
| `src/components/Output.tsx` | the `default:` branch of the switch | Unreachable — `Terminal` validates against `VALID_CMDS` before rendering `Output` — and it duplicates that error markup. Replace with `default: return null;` |
| `src/styles/terminal.css` | `.term-list-body {}` | Empty rule |
| `src/styles/os.css` | the unused `@keyframes window-close` | Defined at `os.css:262`, referenced nowhere |

### 7.3 Fix the double-duty `.experience-row`

File: `src/components/windows/AboutWindow.tsx`

`.experience-row` is applied to both the wrapper `<div>` and the nested `<ul>`,
so the left border and vertical margins are applied twice. Remove the class from
the `<ul>` — `os.css` already styles `.experience-row ul` and
`.experience-row li` as descendants.

### 7.4 Re-run the detector and the audit

```bash
node ~/.claude/plugins/cache/impeccable/impeccable/4.1.1/skills/impeccable/scripts/detect.mjs --json src/styles src/components src/pages
```

Expect `[]` — task 3.9 cleared both previous findings. Then re-run
`/impeccable audit` and compare against the **8/20** baseline. Phases 1–4 alone
should land it around 16–17/20.

### 7.5 Update `AGENTS.md`

`AGENTS.md` currently documents only shell-flag hygiene. It is the tracked
agent-instructions file (`CLAUDE.md` is gitignored — see `.gitignore:44`), and
there is no record anywhere in the repo of what this site now *is*. Add a section
covering:

- **Architecture**: a simulated desktop OS, not a single-page terminal.
  `src/pages/index.astro` renders one `client:only` `<Desktop>` island;
  `WindowManager` holds window state; `OSWindow` is the chrome; the terminal is
  one of six windows.
- **Routes**: `/`, `/projects/<slug>`, `/blog/<slug>`, `/404`, `/rss.xml`.
- **The virtual filesystem** (`src/lib/filesystem.ts`) — generated from the same
  content collections that feed the windows, which is why `cat` never goes stale.
- **Adding a command**: component in `src/components/commands/`, register in
  `src/data/commands.ts`, wire into the `Output.tsx` switch. Side effects go in
  `useEffect`, never the render body — cite the `open` crash as the reason.
- **Theming**: four themes, `data-theme` on `<html>`, pre-paint restore script.
  Record that `--text-dim` is metadata-only and **contrast-locked**, with the
  measured ratios and the note that the scanline overlay costs ~0.5 — otherwise
  the next person will "tidy" the hex values straight back through the floor.
- **The type system rule** from task 2.3.
- **Blog status**: collection exists, first post pending, route built and ready.
- Note `.claude/launch.json`, added for browser preview.

Write it as normal prose, not compressed notes.

### 7.6 Consider `/impeccable init`

There is still no `PRODUCT.md` or `DESIGN.md`, so every judgement call in this
plan was made without a written brief. Before further design work, run
`/impeccable init` to capture product context and `/impeccable document` to
record the design system that now exists. Flag this to the owner rather than
running it unprompted — `init` is an interview and needs them.

---

## Out of scope

Do not do these as part of this plan:

- **Rewriting off React.** The 179 KB client bundle is more than this needs, but
  it is not what is wrong with the site, and a rewrite would stall everything above.
- **Server-rendering the desktop.** Phase 6's `<noscript>` fallback plus real
  project routes gets most of the SEO value for a fraction of the cost.
- **New windows, new themes, new commands.** Six, four, and twenty are plenty.
  The problem was that one of the commands crashed the page.
- **Restyling the OS chrome.** The window manager and the CRT identity are the
  product. This plan fixes and hardens them; it does not replace them.
- **Persisting window positions across reloads.** Tempting once 5.2 lands, and a
  reasonable follow-up — but it is new behavior, not a fix, and it interacts with
  the boot-skip work in 5.1.

## Known trade-offs recorded on purpose

- **Closing the terminal window destroys its scrollback.** `Terminal` unmounts
  when `OSWindow` returns `null`, discarding `cmdHistory`, `navHistory`, and
  `currentPath`. This is defensible as an OS metaphor and is left as-is. If you
  want it to persist, lift that state into `Desktop` — but that is a change of
  behavior, so decide deliberately rather than discovering it later.
- **Window buttons keep the macOS traffic-light colors** (`#ff5f57`, `#febc2e`,
  `#28c840`) and `os.css` keeps its hard-coded `rgba(255,255,255,0.08)` borders.
  Both escape the token system and look faintly wrong in the amber and matrix
  themes. Tokenizing them is a genuine improvement and a genuine yak-shave;
  it belongs in a design pass, not a correctness pass.
