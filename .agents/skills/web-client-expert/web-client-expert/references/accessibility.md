# Accessibility

Read before: any new component, dialog, form field, icon-only button, or table.

**This is the largest gap in the codebase.** Of 153 `.tsx` files in `components/`, 19 use any
`aria-*` attribute and 3 use `sr-only` (two of which are shadcn's own `dialog.tsx` / `sheet.tsx`).
The upstream Vercel rules in `rules/` will never prompt you about this — they are a performance
guide. Treat the checklist below as part of "done", not as a nice-to-have.

## What shadcn already gives you

Don't re-implement these — `components/ui/` is built on Radix:

- **Focus rings**: `focus-visible:ring-[3px] focus-visible:ring-ring/50` is in the `button` cva base.
  Never `outline-none` without a visible replacement.
- **Invalid styling**: `aria-invalid:border-destructive` is already wired — set `aria-invalid` on
  the input and the styling follows.
- **Dialog / Sheet / Dropdown / Select**: Radix handles focus trap, restore-focus-on-close, `Esc`,
  arrow-key navigation, and `aria-expanded`/`aria-controls`.
- **`DialogTitle` is required** by Radix for the accessible name. If the design has no visible
  title, render it inside `<span className="sr-only">` — do not omit it.

## Checklist per element type

### Icon-only buttons

The single most common miss here (`lucide-react` icons in `size="icon"` buttons).

```tsx
// BAD — screen reader announces "button"
<Button size="icon" onClick={onDelete}><Trash2 /></Button>

// GOOD
<Button size="icon" onClick={onDelete} aria-label="Xóa khóa học"><Trash2 aria-hidden /></Button>
```

Decorative icons next to text need `aria-hidden` so the label isn't read twice.

### Form fields

`htmlFor` is used in 47 places, so the habit exists — keep it. The full pairing:

```tsx
<Label htmlFor="course-name">Tên khóa học</Label>
<Input
  id="course-name"
  {...form.register('name')}
  aria-invalid={!!form.formState.errors.name}
  aria-describedby={form.formState.errors.name ? 'course-name-error' : undefined}
/>
{form.formState.errors.name && (
  <p id="course-name-error" className="text-destructive text-sm">
    {form.formState.errors.name.message}
  </p>
)}
```

A red border alone does not communicate the error. The message must be programmatically linked.

### Tables

TanStack Table renders into shadcn's `<Table>`, which is real `<table>` markup — keep it that way,
don't rebuild rows as divs. Add `scope="col"` on header cells. A row-action column needs a header
cell even if visually empty (`<TableHead><span className="sr-only">Hành động</span></TableHead>`).

### Loading & async

- A `Skeleton` block is invisible to a screen reader. On a region that swaps content after load,
  add `aria-busy={isLoading}`, and for content that arrives without user action use
  `aria-live="polite"` on the container.
- `sonner` toasts are announced by default — don't also render a duplicate inline message.
- Disabled submit buttons during a mutation should stay focusable-announceable: prefer
  `aria-disabled` + ignoring the click over `disabled` when the user might tab back to it.

### Interactive non-buttons

Never put `onClick` on a `<div>` or `<TableRow>` as the only way to reach something. If a row is
clickable, the primary action must also exist as a real `<Link>`/`<Button>` inside it.

### Color & dark mode

The palette is token-based (`text-muted-foreground`, `bg-accent`) and both themes ship. When you
introduce a new color, check contrast **in both themes** — `dark:` variants that pass in light mode
routinely fail in dark. Never encode meaning in color alone: a status badge needs its text label,
not just a hue.

### Images

`components/` has 9 files using raw `<img>` and 2 using `next/image`. Either way: `alt` is
mandatory. Decorative thumbnails take `alt=""` (empty, not missing) — see `CourseThumbnail`, which
does this correctly.

## Quick audit before you finish

1. Tab through the feature with the mouse untouched — can you reach and trigger everything?
2. Does focus land somewhere sensible when a dialog opens, and return when it closes?
3. Does every icon-only control have an `aria-label`?
4. Is every error message linked with `aria-describedby`?
5. Does anything convey state by color alone?
6. Toggle dark mode and re-check contrast.
