# Data fetching & state — React Query v5 + Zustand

Read before: adding a hook, changing invalidation, adding a mutation, or debugging stale UI.

## Query keys are a contract

Every resource exports a key factory from its hook file. Invalidation targets a **prefix**, so the
hierarchy matters:

```typescript
export const enrollmentKeys = {
  all: ['enrollments'] as const,                                    // invalidate everything
  list: (query: ListEnrollmentsQuery = {}) => ['enrollments', query] as const,
  progress: (id: string) => ['enrollments', id, 'progress'] as const,
};
```

- **Never inline a key literal** in a component or a second hook. Two spellings of the same key mean
  a mutation silently fails to refresh a list.
- Filter/pagination state belongs **in the key** (`['enrollments', query]`), so changing a filter
  refetches instead of showing another page's data.
- Keys must be serialisable and stable — don't put a function, a `Date`, or a freshly-built object
  literal with unstable key order in there.

## Global defaults — don't re-declare

`components/providers/providers.tsx`:

```typescript
new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } })
```

`staleTime: 60s` means a remount inside a minute does **not** refetch. If your feature needs
fresher data (a live counter, a polling status), set `staleTime`/`refetchInterval` on that one hook
and say why in a comment. Don't lower the global default.

## Lists and pagination

```typescript
useQuery({
  queryKey: enrollmentKeys.list(query),
  queryFn: () => enrollmentApi.list(query),
  placeholderData: keepPreviousData,  // page change keeps the old rows visible
  enabled,
});
```

`keepPreviousData` is the house style for anything paginated — without it the table flashes empty
on every page change. Pair it with `isFetching` (not `isLoading`) to show a subtle busy state,
since `isLoading` is false when previous data is showing.

## Mutations: write-through, not optimistic

The codebase uses **`setQueryData` on success** (a cache write-through), plus invalidation:

```typescript
export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => courseApi.update(id, data),
    onSuccess: (data) => {
      qc.setQueryData(courseKeys.detail(data.id), data);   // detail is authoritative immediately
      void qc.invalidateQueries({ queryKey: courseKeys.all }); // lists refetch
    },
  });
}
```

There is **no `onMutate` anywhere** in the repo — no true optimistic updates, no rollback. That is
a deliberate simplicity, and fine for admin CRUD. If you introduce optimism, do it completely:

```typescript
onMutate: async (vars) => {
  await qc.cancelQueries({ queryKey: key });          // stop in-flight refetch clobbering us
  const prev = qc.getQueryData(key);
  qc.setQueryData(key, optimistic(prev, vars));
  return { prev };                                     // context for rollback
},
onError: (_e, _v, ctx) => qc.setQueryData(key, ctx?.prev),
onSettled: () => void qc.invalidateQueries({ queryKey: key }),
```

Half-done optimism (mutate the cache, no rollback) is worse than none.

## Dependent & conditional queries

Use `enabled`, never an early `return` before the hook (that breaks the rules of hooks):

```typescript
export function useEnrollmentProgress(id: string, enabled = true) {
  return useQuery({ queryKey: ..., queryFn: ..., enabled: !!id && enabled });
}
```

The `(query, enabled = true)` signature is the house convention — keep it so callers can gate on
role or dialog-open state.

## Parallel fetching

Two independent requests must not waterfall. The repo's example, worth copying:

```typescript
export async function fetchMyLearnDashboard() {
  const { traineePhaseApi } = await import('@/lib/api/trainee-phase.api'); // also code-splits
  const [courses, phases] = await Promise.all([enrollmentApi.myCourses(), traineePhaseApi.myPhases()]);
  return { courses, phases };
}
```

Deriving one dataset from another to "save a request" is how the learner dashboard once hid phases
that had no enrolled course — read the comment on that function before changing it.

## Live data (SSE)

`use-notification-sse.ts` holds one `EventSource` to `/notifications/stream`:

- `EventSource` reconnects by itself, forever — **do not hand-roll retry/backoff**.
- `onopen` re-invalidates (covers events missed while disconnected); `onmessage` bumps the cached
  count via `setQueryData` so the badge updates with zero HTTP calls.
- Heartbeats are a named `ping` event so they never reach `onmessage`.
- Always `return () => eventSource.close()` from the effect. A leaked connection per navigation is
  the classic bug here.

## Zustand

Client-only state: auth session (`stores/auth-store.ts`) and transient UI. Never server data.

- **Always select**: `useAuthStore((s) => s.user)`. Subscribing to the whole store re-renders on
  every unrelated change.
- Selectors returning a new object/array each call cause infinite re-renders — select primitives,
  or memoize.
- Auth hydration happens in `components/providers/auth-hydration.tsx`; `user` is `null` on first
  client render. Guard for it rather than assuming a logged-in shape.
- `RouteGuard` redirects on missing role — a **UX affordance only**. The API re-checks scope; never
  treat a hidden route as security.

## Debugging stale UI — check in this order

1. Did the mutation invalidate the right key **prefix**?
2. Is the list key including the filter/page object, so it actually changed?
3. Is `staleTime: 60s` masking the refetch you expected?
4. Is a second hook using a hand-written key literal that doesn't match the factory?
