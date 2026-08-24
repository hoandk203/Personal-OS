# Logging, errors & operability

Read before: adding a background job, an integration, or anything whose failure would be silent.

## Logging

NestJS's built-in `Logger`, instantiated per class — 41 of them across the codebase:

```typescript
private readonly logger = new Logger(SlackNotifierService.name);
```

- `logger.log()` for a meaningful state change (job started/finished with a count, sync result).
- `logger.warn()` for a recovered/expected-but-notable condition (config missing, skipped item).
- `logger.error(message, stack)` for a genuine failure — **always** include the stack.
- `console.*` is effectively banned in `src/` (only `main.ts` uses `console.warn` for the boot
  banner). Use `Logger`.
- **Every message that can carry an integration payload or an HTTP error goes through `redact()`**
  from `@/common/logging/redact.ts`. Slack/ChatWork/GitLab error objects routinely embed the token.
- Log **counts and ids**, never bodies. Never log an email body, a token, a password hash, or a
  full user record.
- A log line with no id in it is nearly useless in production — include the entity id you acted on.

## Error handling

- There is **no global exception filter** in this codebase. NestJS's default filter serialises
  `HttpException` bodies, which is why `withCode()` returning `{ message, code }` reaches the client
  intact. Don't add a filter without checking it preserves that shape — the web client's
  `error-messages.ts` lookup depends on `code`.
- **Never swallow.** `catch {}` and `catch (e) { return null }` are bugs unless the empty case is
  the documented business answer, and then it needs a comment saying so.
- Catch narrowly. Wrapping a whole use-case in try/catch to log-and-rethrow adds noise; catch at the
  boundary that can actually recover (an integration call, a parse).
- Translate infrastructure errors into domain exceptions at the repository/service boundary so
  use-cases deal in domain terms. `src/common/utils/db-errors.ts` exists for mapping Postgres
  constraint violations — use it rather than string-matching error messages inline.
- In a Bull processor, letting the error propagate is correct: that's what triggers the retry.
  Log with `redact()` first.

## Operability gaps

| Gap | Consequence | What to do |
| --- | --- | --- |
| No `/health` endpoint, no `@nestjs/terminus` | Nothing to point a container healthcheck or load balancer at | Propose it if you're touching deployment |
| No request id / correlation id | Two concurrent requests' logs interleave with nothing to separate them | Consider it when debugging a production issue |
| No metrics | No visibility into queue depth, job failure rate, endpoint latency | Out of scope unless asked |
| No global exception filter | Unhandled non-HTTP errors return a bare 500 with no code | Acceptable today; don't "fix" it casually (see above) |

These are listed so you don't assume they exist. Don't add them as a side effect of an unrelated
task — mention them and let the user decide.

## Before declaring a background feature done

1. Does a failure produce a log line that names the entity and the reason?
2. Is that log line safe if the payload contains a token?
3. If the job runs twice, is the outcome the same?
4. If the job never runs (Redis down, cron missed), does anything detect it — or does it fail silent?
5. Is the empty case (`0 items to process`) logged, so "nothing happened" is distinguishable from
   "nothing ran"?

Question 5 is the one that gets skipped and the one that costs the most later.
