# Dates, times & language

Read before: rendering any timestamp, computing a date range, or writing user-facing copy.

## Language rule

**UI copy is Vietnamese. Identifiers, comments, commit messages, and API messages are English.**

- Labels, buttons, empty states, toasts, zod validation messages → Vietnamese.
- Variable names, component names, props, file names → English.
- Do not rename an identifier to Vietnamese; do not ship an English label.
- There is **no i18n library** — strings are inline. Don't introduce `next-intl` or similar as a
  side effect of another task; it's a project-level decision.

Toast style follows the codebase: `toast.success('Đã cập nhật phase')`, `toast.error(...)` — past
tense, short, no trailing punctuation on the success case.

## Formatting helpers — use them, don't re-roll

`src/lib/date-utils.ts`:

| Helper | Output |
| --- | --- |
| `fmtViDateTime(iso, fallback = '—')` | `12 thg 7, 2026 14:30` |
| `fmtViDate(iso, fallback = '—')` | `12/7/2026` |
| `formatDateDDMMYYYY(iso)` | `12-07-2026` |
| `fmtViTime(date)` | `14:30:00` |
| `dateToInput(date)` / `isoToDateInput(iso)` | `2026-07-12` for `<input type="date">` |

Plus `format-relative-time.ts` ("2 giờ trước") and `format-duration.ts`.

The `fallback = '—'` convention matters: an absent date renders as an em dash, not `Invalid Date`
and not an empty cell. Keep it.

## The timezone trap

**These helpers use `toLocaleString('vi-VN', …)` without an explicit `timeZone`, so they render in
the *browser's* timezone, not `Asia/Ho_Chi_Minh`.**

For users physically in Vietnam that's identical and invisible. It stops being identical when:

- a user travels or has a machine set to another timezone;
- you compute a **date boundary** in the client ("is this today?", "which week is this in?");
- you compare a client-derived date string against a server-computed one.

Rules:

- **Display** — the existing helpers are fine.
- **Business logic on dates — do it on the server.** "Which sprint / week / working day does this
  belong to" is a backend question. `VIETNAM_TIMEZONE` lives in the API's constants and the cron
  jobs are timezone-pinned there for exactly this reason.
- If you must bucket by day client-side, pass `{ timeZone: 'Asia/Ho_Chi_Minh' }` explicitly and say
  so in your reply.
- `new Date(isoString)` is correct for parsing an API timestamp (they're ISO with an offset).
  `new Date('2026-07-12')` parses as **UTC midnight** and can render as the previous day — never
  build a `Date` from a bare date string for display.

There is a known historical data issue where migrated working-time records were stored as
Vietnam-local time labelled UTC, producing a double `+7h` offset. When numbers look shifted by
roughly seven hours, that's the first thing to check — and it is a data problem, not a formatting
one, so don't "fix" it in the component.

## Date inputs

`<input type="date">` needs `yyyy-MM-dd` — that's what `dateToInput` / `isoToDateInput` exist for.
Going the other way, the value is a bare date string: send it to the API as-is and let the server
attach the timezone. Don't `new Date(value).toISOString()` in the component; that's the UTC-midnight
bug above.

## Numbers and durations

Vietnamese number formatting uses `.` as the thousands separator — use
`toLocaleString('vi-VN')` for counts shown to users. Durations go through `format-duration.ts`
rather than ad-hoc `Math.floor(x / 60)` arithmetic.
