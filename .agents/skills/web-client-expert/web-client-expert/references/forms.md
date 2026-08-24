# Forms — react-hook-form + zod

Read before: any create/edit dialog, filter bar, or multi-step input.

## The house pattern

Schema in the same file as the component, `zod` v3, Vietnamese messages, one schema shared by
create and edit so `FormData` stays stable:

```typescript
const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(255),
  code: z
    .string()
    .min(1, 'Mã không được để trống')
    .max(20, 'Tối đa 20 ký tự')
    .regex(/^[A-Za-z0-9-]+$/, 'Chỉ cho phép chữ, số và dấu gạch ngang'),
  target: z.enum(['trainee', 'employee']),
  condition: z.string().max(1000).optional(),
});
type FormData = z.infer<typeof schema>;

const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { name: phase?.name ?? '', /* ... */ },
});
```

Rules that fall out of this:

- **`defaultValues` must be fully populated** — `?? ''` for every string, never `undefined`.
  An input that starts `undefined` and later gets a value flips from uncontrolled to controlled and
  React warns (and the field silently loses its first keystroke).
- **Derive types from the schema** (`z.infer`), never hand-write a parallel interface.
- Validation messages are **Vietnamese**; field names and the schema variable stay English.
- Where create and edit differ, branch in `onSubmit` on `isEdit`, don't fork the schema.

## Every field needs its error rendered

`zodResolver` populates `formState.errors` but renders nothing. A field without a visible,
linked message is an unfinished field — see `references/accessibility.md` for the
`aria-invalid` + `aria-describedby` pairing.

## Submitting

```typescript
const onSubmit = (values: FormData) => {
  updateMutation.mutate(
    { id: phase.id, data: { name: values.name, condition: values.condition || undefined } },
    {
      onSuccess: () => { toast.success('Đã cập nhật phase'); onSuccess(); },
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Có lỗi xảy ra'),
    },
  );
};
```

- Per-call callbacks (2nd arg of `mutate`) for UI concerns — toast, close dialog. Hook-level
  `onSuccess` for cache invalidation. Keep the split.
- **Empty string → `undefined`** before sending. The API's `whitelist`/`forbidNonWhitelisted` pipe
  and optional DTO fields expect absence, not `''`.
- Disable the submit button on `isPending` **and** guard against double submit — a dialog that stays
  open during a slow request will get clicked twice.
- Don't send fields the endpoint rejects. `PATCH /phases/:id` doesn't accept `target`; the form
  still holds it, so `onSubmit` picks fields explicitly rather than spreading `values`.

## Server-side errors

The API returns `{ message, code }`, already translated to Vietnamese by `api-client.ts`. Two
levels of handling:

- **Whole-form failures** (409 conflict, 403) → `toast.error(e.message)`. This is what the codebase
  does everywhere.
- **Field-specific failures** (a name conflict that should point at the name input) → map it:
  `form.setError('name', { message: e.message })`. Better UX; use it when the error clearly belongs
  to one field.

Never re-translate an error string in the component — the mapping lives in `lib/error-messages.ts`.

## Things the codebase doesn't do yet (do them properly if you add them)

- **Unsaved-changes guard**: nothing warns before closing a dirty dialog. If you add one, use
  `formState.isDirty`, and remember Radix closes on `Esc` and outside-click too.
- **Field arrays**: `useFieldArray` for repeatable rows (see `string-list-field.tsx` for the
  hand-rolled equivalent). Give each row a stable key from the field id, not the index.
- **Async/uniqueness validation**: don't debounce a query inside the resolver; let the server return
  a 409 and map it with `setError`.
- **File upload fields**: `react-dropzone` is available. Validate type and size client-side for UX,
  but never rely on it — the API re-validates.

## Filter bars are forms too

The list screens use plain `useState` + `useDebounce` for search rather than RHF, which is fine for
2–3 controls. Match the neighbours: don't introduce RHF into an existing filter bar, and don't
hand-roll state for a real create/edit form.

Filter changes must reset pagination to page 1 (`setPage(1)`), or the user lands on an empty page 7
of a 2-page result.
