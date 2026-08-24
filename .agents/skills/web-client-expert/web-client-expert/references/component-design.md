# Component design & file organization

Read before: creating a new component, or when a file crosses ~250 lines.

## Where things go

```
app/(main)/<route>/page.tsx        Server Component: metadata + PageHeader + Suspense
components/<feature>/              feature-grouped; kebab-case files
components/ui/                     shadcn primitives — treat as vendored, edit sparingly
components/layout/                 shell: sidebar, header, page-header
hooks/use-<resource>.ts            React Query wrappers + key factory
lib/api/<resource>.api.ts          fetch functions + request/response types
```

Naming convention that carries meaning:

- `*-client.tsx` — the `'use client'` entry a page renders inside `Suspense`
  (`course-list-client.tsx`, `course-detail-client.tsx`)
- `*-form-dialog.tsx` / `*-modal.tsx` — a Radix dialog wrapping a form
- `*-panel.tsx`, `*-card.tsx`, `*-row.tsx` — presentational pieces

Follow it. A new list screen that isn't called `<feature>-list-client.tsx` is harder to find than
it needs to be.

## Server vs client boundary

Default to Server Components. `'use client'` only for: browser APIs, event handlers, React Query,
Zustand, or a Radix primitive with state.

Push the boundary **down**, not up. A page that marks itself `'use client'` to render one
interactive button drags its whole subtree into the bundle. The repo's shape — server page →
`Suspense` → one client component — is the right default; when a page has a heavy static header and
a small interactive widget, split the widget out rather than clientizing the page.

## shadcn components in this repo

`components/ui/` uses the **current** shadcn style — plain function components, no `forwardRef`
(React 19 passes `ref` as a normal prop), `cva` for variants, `radix-ui` as a single package, and
`cn()` (`clsx` + `tailwind-merge`) for class merging.

```tsx
function Button({ className, variant = 'default', size = 'default', asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
```

- **Always merge `className` last through `cn()`** so callers can override; `twMerge` resolves
  Tailwind conflicts properly, plain template strings don't.
- Add a **variant** to the cva config rather than passing a one-off `className` at five call sites.
- Use `asChild` to compose (`<Button asChild><Link …/></Button>`) instead of nesting a `<Link>`
  inside a `<button>` — which is invalid HTML.
- Editing a `components/ui/` file affects every screen. Prefer wrapping in `components/<feature>/`.

## Props API

- Props interface named `Props` for single-purpose components (house style), or
  `<Component>Props` when exported.
- **Composition over configuration.** A component with `showHeader`, `showFooter`, `variant`,
  `compact` booleans wants to be two or three components, or `children`.
- Booleans default to `false` and read positively — `disabled`, not `notEnabled`.
- Pass ids, not entities, when the child re-fetches; pass the entity when the parent already has it.
  Don't do both.
- Callbacks are `onX` and describe the event (`onSuccess`, `onClose`), not the implementation
  (`onRefetchList`).

## Splitting a large file

The 300-line limit is a hard rule in `CLAUDE.md`. When a `*-client.tsx` grows past it, split by
**responsibility**, not by line count:

1. Column definitions (TanStack `ColumnDef[]`) → their own `*-columns.tsx`
2. Each dialog → its own `*-dialog.tsx`
3. Row rendering → `*-row.tsx`
4. Non-visual logic → a local hook in `hooks/`

Fighting the limit by deleting comments or collapsing formatting is the wrong answer.

## Re-render hygiene (React Compiler is OFF)

Nothing memoizes for you. The `rerender-*` rules in `rules/` apply literally. The ones that bite
most in this codebase:

- **`ColumnDef[]` must be `useMemo`'d** — a fresh array every render resets TanStack Table state.
- Callbacks passed into memoized children need `useCallback`, or the memo does nothing.
- Object/array props built inline (`style={{...}}`, `data={items.filter(...)}`) break memoization.
- `useState(expensiveInit())` runs every render — pass the function: `useState(() => expensiveInit())`.
- Zustand: select primitives, not derived objects (see `references/data-state.md`).

Measure before adding `memo()` everywhere — but for tables and long lists, assume it's needed.

## Code splitting

Real wins here, per `bundle-dynamic-imports`: the TipTap editor (`@tiptap/*`, 12 packages), the
`@dnd-kit` sortable machinery, and heavy dialogs that only open on click. Use `next/dynamic` with a
skeleton `loading:`. Don't dynamic-import something that renders on first paint — you'll add a
round-trip for nothing.

## Every list screen needs four states

Loading (skeleton), empty ("Chưa có khóa học nào"), error (toast or inline), and data. The empty
state is the one that gets forgotten, and a blank table looks like a bug.
