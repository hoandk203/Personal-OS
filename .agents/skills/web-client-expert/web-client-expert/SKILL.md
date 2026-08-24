---
name: web-client-expert
description: Use when building or reviewing anything in apps/web-client — the Zinza LMS Next.js 16 / React 19 frontend. Part 1 is the project's own conventions (App Router + React Query + Zustand + shadcn/ui + react-hook-form/zod, Vietnamese UI copy); references/ covers accessibility, forms, data/state, component design, Tailwind v4 styling and dates/i18n; scripts/ enforces accessibility basics; Part 2 is Vercel's 45 performance rules in rules/. Keywords: React, Next.js, web-client, component, page, hook, useQuery, useMutation, form, dialog, table, accessibility, dark mode, Tailwind, performance, bundle, re-render.
license: MIT
metadata:
  author: "Part 2 (rules/): Vercel Engineering, MIT. Part 1 + references/ + scripts/: adapted for zinza-lms"
  version: "3.0.0-lms"
  adapted: "2026-07-23"
  renamedFrom: vercel-react-best-practices
---

# Web Client Expert — Zinza LMS

Two layers. **Part 1 wins on conflict** — it describes what this codebase actually does.
Part 2 is Vercel's upstream performance guide, kept verbatim in `rules/` (MIT, Vercel Engineering).

## This skill is a baseline, not a ceiling

- **Precedence**: existing code → `CLAUDE.md` → Part 1 → Part 2 → general React knowledge.
- Part 2 is a **performance** guide only. It says nothing about accessibility, forms, data
  modelling, error UX, i18n, or component API design — apply the right practice anyway.
- Upstream was written against SWR and pre-19 React. Translate before applying (see §1.9).
- When you override a rule, say which one and why.

## Deep references — read on demand

This file is the always-loaded core. Open the matching reference **before** working in that area;
each is grounded in this codebase, and together they cover what Part 2 (performance only) does not.

| File | Read it before |
| --- | --- |
| `references/accessibility.md` | **Any** new component, dialog, icon button, form field, or table — this is the codebase's biggest gap |
| `references/data-state.md` | Adding a hook, changing invalidation, mutations, SSE, Zustand, debugging stale UI |
| `references/forms.md` | Any create/edit dialog or filter bar — RHF + zod, server error mapping, submit rules |
| `references/component-design.md` | Creating a component, splitting a file over 300 lines, memoization, code splitting |
| `references/styling.md` | Tailwind v4 tokens, dark mode, `cn()`/`cva`, motion, images |
| `references/dates-i18n.md` | Rendering a timestamp, date math, or writing user-facing copy |

## Enforcement — run this, don't eyeball it

```bash
bash .claude/skills/web-client-expert/scripts/check-a11y.sh
```

Flags icon-only `<Button>`s with no accessible name, `<img>` without `alt`, and `<DialogContent>`
with no `DialogTitle`. Nothing else in the toolchain checks any of this — eslint and `tsc` are both
happy with an unlabelled icon button. Exits non-zero on findings.

---

# Part 1 — Project conventions (authoritative)

## 1.1 Stack reality check

| Thing | Reality in `apps/web-client` |
| --- | --- |
| Framework | Next.js 16 App Router, React 19 |
| Server data | **TanStack React Query v5** — not SWR, not `fetch` in components |
| Client state | Zustand v5 (`stores/auth-store.ts`) |
| UI | shadcn/ui in `components/ui/` + Tailwind v4 + `lucide-react` |
| Forms | `react-hook-form` + `zod` v3 via `@hookform/resolvers/zod` |
| Tables | TanStack Table v8 |
| Toasts | `sonner` |
| React Compiler | **OFF** — not in `next.config.ts`, not in deps. Manual memoization still matters. |
| PPR / `use cache` | Not enabled. No `dynamicIO`, no `cacheComponents`. |
| Source root | `src/` — `@/` maps to `apps/web-client/src/` |

## 1.2 Page → Suspense → client component

Every routed page is a **Server Component** that sets `metadata`, renders a `PageHeader`, and wraps
the interactive part in `Suspense` with a skeleton fallback:

```tsx
export const metadata = { title: 'Khóa học' };

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon={BookOpen} title="Khóa học" description="Quản lý toàn bộ khóa học" />
      <Suspense fallback={<ListSkeleton />}>
        <CourseListClient />
      </Suspense>
    </div>
  );
}
```

The `*-client.tsx` component carries `'use client'` and does all data fetching through hooks.
Pages themselves never call the API. There are **no `error.tsx` / `loading.tsx` files anywhere** in
this app today — don't assume one exists, and only add one when asked.

## 1.3 Data access is a three-file chain

`components/*-client.tsx` → `hooks/use-<resource>.ts` → `lib/api/<resource>.api.ts` → `lib/api-client.ts`

Never skip a link. Never call `apiClient` from a component.

**API layer** (`lib/api/<resource>.api.ts`) — plain functions + exported request/response types:

```typescript
export const enrollmentApi = {
  list: (query: ListEnrollmentsQuery = {}) =>
    apiClient.get<CursorPaginatedEnrollmentsDto>('/enrollments', { params: query as ... }),
  remove: (id: string) => apiClient.delete<void>(`/enrollments/${id}`),
};
```

**Hook layer** (`hooks/use-<resource>.ts`) — `'use client'`, an exported **key factory**, then thin
`useQuery` / `useMutation` wrappers. Mutations invalidate through the factory, never a literal key.
Paginated lists use `placeholderData: keepPreviousData`. Query defaults are global in
`components/providers/providers.tsx` (`staleTime: 60_000`, `refetchOnWindowFocus: false`) — don't
re-declare them per hook.

Full patterns — key design, invalidation vs `setQueryData`, optimistic updates, dependent queries,
SSE, Zustand selectors → `references/data-state.md`

## 1.4 Pagination

Server list endpoints are mostly **offset**-paginated. The client reads `?page` from the URL via
`usePageParam()` (1-indexed, `page <= 1` clears the param, `router.replace` so history stays clean),
renders `components/ui/pagination.tsx`, and builds the strip with `getPaginationRange()` from
`lib/pagination.ts`. Pair with `keepPreviousData`. A few feed-like endpoints are cursor-based
(enrollments, notifications) — check `lib/api/<resource>.api.ts` before assuming.

## 1.5 Forms

`react-hook-form` + `zodResolver`, schema declared in the same file with **Vietnamese validation
messages**, types derived via `z.infer`. One schema shared by create and edit keeps `FormData`
stable; branch on `isEdit` in `onSubmit`. `defaultValues` must be fully populated (`?? ''`) or the
field flips uncontrolled → controlled. Submit via the mutation's per-call callbacks, then
`toast.success('Đã cập nhật ...')` and close.

Full patterns — error rendering, server-error mapping, empty-string handling, field arrays,
filter bars → `references/forms.md`

## 1.6 Errors are already translated — don't re-translate

`api-client.ts` maps the API's `{ message, code }` to a Vietnamese string via
`lib/error-messages.ts` when building `ApiError`. In components just surface it:

```typescript
onError: (e) => toast.error(e instanceof Error ? e.message : 'Có lỗi xảy ra'),
```

Adding a new backend error code means adding its Vietnamese entry to `ERROR_MESSAGES` — the record
is exhaustive over `ErrorCode`, so a missing one is a **compile error**, not a runtime gap.

## 1.7 Language

**UI copy is Vietnamese. Identifiers, comments, commit messages are English.** Never ship an
English label into the UI, and never rename an identifier to Vietnamese.

## 1.8 Client/server boundary

`'use client'` only for browser APIs, event handlers, React Query, or Zustand. Read Zustand with a
selector (`useAuthStore((s) => s.user)`), never the whole store. Role checks in the UI are for
affordances only — the API re-checks scope, so never treat a hidden button as authorization.

## 1.9 Upstream rules that need translating here

| Upstream rule | In this repo |
| --- | --- |
| `client-swr-dedup` (SWR) | React Query dedups by `queryKey` — use the key factory; that *is* the dedup |
| `async-dependencies` (`better-all`) | Not a dependency. Use `Promise.all` (see `fetchMyLearnDashboard`) |
| `server-cache-react` / `server-cache-lru` | Pages fetch nothing server-side today; applies only if you add a Server Component fetch |
| `rerender-*` | **Fully applicable** — React Compiler is off, so `memo`/`useCallback`/`useMemo` are manual |
| `rendering-activity` | React 19 `<Activity>` — verify it's exported by the installed React before using |
| `bundle-dynamic-imports` | Real wins here: TipTap editor, `@dnd-kit`, chart/table-heavy dialogs |

---

# Part 2 — Vercel performance rules (upstream, unmodified)

45 rules across 8 categories, priority-ordered — one file per rule in `rules/<name>.md`, each with
frontmatter (`impact`, `impactDescription`, `tags`), a why, an incorrect example, and a correct one.

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

**1. Waterfalls** — `async-defer-await`, `async-parallel`, `async-dependencies`, `async-api-routes`,
`async-suspense-boundaries`

**2. Bundle** — `bundle-barrel-imports`, `bundle-dynamic-imports`, `bundle-defer-third-party`,
`bundle-conditional`, `bundle-preload`

**3. Server** — `server-cache-react`, `server-cache-lru`, `server-serialization`,
`server-parallel-fetching`, `server-after-nonblocking`

**4. Client fetching** — `client-swr-dedup`, `client-event-listeners`

**5. Re-render** — `rerender-defer-reads`, `rerender-memo`, `rerender-dependencies`,
`rerender-derived-state`, `rerender-functional-setstate`, `rerender-lazy-state-init`,
`rerender-transitions`

**6. Rendering** — `rendering-animate-svg-wrapper`, `rendering-content-visibility`,
`rendering-hoist-jsx`, `rendering-svg-precision`, `rendering-hydration-no-flicker`,
`rendering-activity`, `rendering-conditional-render`

**7. JavaScript** — `js-batch-dom-css`, `js-index-maps`, `js-cache-property-access`,
`js-cache-function-results`, `js-cache-storage`, `js-combine-iterations`, `js-length-check-first`,
`js-early-exit`, `js-hoist-regexp`, `js-min-max-loop`, `js-set-map-lookups`, `js-tosorted-immutable`

**8. Advanced** — `advanced-event-handler-refs`, `advanced-use-latest`

Category 7 is micro-optimization: apply it when a list is genuinely large, not as a default style.

---

## Definition of done

1. Page is a Server Component with `metadata` + `Suspense` + skeleton; logic sits in `*-client.tsx`.
2. Data goes component → hook → api file; key factory used for both query and invalidation.
3. Form uses RHF + zod with Vietnamese messages; mutation shows a `sonner` toast.
4. Loading **and** empty states rendered; no bare spinner-less fetch.
5. **Accessibility pass done** — icon buttons labelled, field errors linked with `aria-describedby`,
   keyboard-reachable, checked in both themes (`references/accessibility.md`).
6. Colors use semantic tokens, not raw `gray-*`/hex; verified in light **and** dark.
7. No `any`; no default export outside `page.tsx` / `layout.tsx`; file under 300 lines.
8. `pnpm --filter web-client exec tsc --noEmit` and `pnpm lint` clean.
9. Report what you applied beyond this skill and what you deliberately skipped.

## Still not covered anywhere — use your own judgment

Even with the references, nothing here covers: automated testing of components (deferred by
`CLAUDE.md`), analytics/telemetry, offline behaviour, print styles, animation choreography beyond
the existing utilities, or SEO past the `metadata` export. Part 2 is a performance guide and will
never prompt you on any of it. Apply what's right and say what you did.
