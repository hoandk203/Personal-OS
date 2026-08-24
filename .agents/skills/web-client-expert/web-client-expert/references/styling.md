# Styling — Tailwind v4 + shadcn tokens + dark mode

Read before: writing any markup with classes, adding a color, or touching `globals.css`.

## Tailwind v4 is CSS-first — there is no `tailwind.config.js`

Everything lives in `src/app/globals.css`, structured in two documented stages:

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));   /* class-based dark mode */

@theme { /* 1. registers Tailwind utility classes: --color-*, --shadow-*, ... */ }

@layer base {
  :root { /* 2. the CSS variables — single source of truth; @theme maps derive from here */ }
  .dark { /* dark overrides */ }
}
```

- **Don't create `tailwind.config.js`.** v4 reads `@theme` from CSS. Adding a JS config forks the
  configuration.
- New design tokens go in `:root` **and** `.dark`, then get exposed via `@theme` if they need a
  utility class. 155 custom properties already exist — check before inventing a new one.
- Custom utilities use the v4 `@utility` directive (`hover-lift`, `press` are defined this way), not
  `@layer utilities { .foo {} }`.

## Use tokens, never raw colors

```tsx
// BAD — invisible or unreadable in the other theme
<div className="bg-white text-gray-900 border-gray-200">

// GOOD — flips automatically
<div className="bg-card text-card-foreground border-border">
```

The semantic pairs: `background`/`foreground`, `card`/`card-foreground`, `primary`/`primary-foreground`,
`secondary`, `muted`/`muted-foreground`, `accent`/`accent-foreground`, `destructive`, `border`,
`input`, `ring`. Status colors exist too (`--color-danger`, `--color-info`, `--color-warning`).

A hardcoded hex or a `gray-*`/`slate-*` utility in a component is a bug waiting for someone to
switch themes. If you genuinely need a new color, add the token in both `:root` and `.dark`.

## Dark mode

Class strategy: `.dark` on `<html>`, toggled by `applyTheme()` in `lib/theme.ts`, persisted to
`localStorage` under `lms-theme`.

`THEME_SCRIPT` is an inline, dependency-free script injected at the top of `<body>` that applies the
class **before first paint** — this is what prevents the flash of wrong theme. Two consequences:

- Don't move theme resolution into React state alone; the pre-paint script is load-bearing.
- Don't read `localStorage` during render (it breaks SSR). `resolveInitialTheme()` guards with
  `typeof window === 'undefined'` — follow that shape.

Always visually check both themes before finishing. Reviewing only in light mode is how contrast
bugs ship.

## Class composition

```tsx
className={cn('base classes', condition && 'conditional', className)}
```

`cn()` = `clsx` + `twMerge`. Always route through it when a component accepts `className`, and put
the incoming `className` **last** so callers can override. Plain string concatenation leaves both
`p-2` and `p-4` in the class list and lets specificity decide arbitrarily.

For variant-driven styling use `cva` (see `components/ui/button.tsx`) rather than a chain of
ternaries. Status→style maps belong in a `const` object next to the type
(`COURSE_STATUS_VARIANT` in `lib/api/course.api.ts` is the existing pattern).

## Motion & reduced motion

`globals.css` already honours `prefers-reduced-motion: reduce` for the `hover-lift` and `press`
utilities. Any new animation you add must do the same — an unguarded animation is an accessibility
regression, not just a preference.

Transitions in the codebase are short (0.1–0.2s) with `cubic-bezier(0.4, 0, 0.2, 1)`. Match that
rather than inventing new durations.

## Layout

- Vertical rhythm on pages is `space-y-6`; inside cards `space-y-2`/`space-y-4`. Follow the
  neighbours instead of hand-tuning margins.
- Mobile matters — the sidebar collapses into a `Sheet`. Test a narrow viewport; wide tables need a
  scroll container (`overflow-x-auto`), never a page that scrolls sideways.
- Prefer flex/grid utilities over fixed pixel widths; `min-w-0` on flex children is the fix for the
  "long text refuses to truncate" problem.

## Images

`next.config.ts` allows remote images from the RustFS host (`localhost:29000/lms/**`) and
`lh3.googleusercontent.com` (Google avatars). Adding a new remote source means adding a
`remotePatterns` entry — `next/image` will hard-fail otherwise.

The codebase currently uses raw `<img>` in 9 places and `next/image` in 2. Prefer `next/image` for
new work (sizing, lazy loading, format negotiation); when you use raw `<img>` for a source that can
404, copy `CourseThumbnail`'s `onError` fallback rather than leaving a broken-image icon.
