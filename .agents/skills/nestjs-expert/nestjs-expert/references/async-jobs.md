# Async work — events, Bull queues, cron

Read before: sending anything to an external service, adding a notification, or writing a scheduled
job.

## Three mechanisms, three purposes

| Mechanism | Use for | Failure behaviour |
| --- | --- | --- |
| `EventEmitter2` | in-process fan-out, decoupling modules | **fire-and-forget, in-band** — a throwing listener can surface in the request |
| Bull v4 queue | anything external, slow, or retryable | retried, survives restart (Redis-backed) |
| `@Cron` (`@nestjs/schedule`) | digests, syncs, reconciliation | runs on **every** instance unless guarded |

## EventEmitter2

Configured globally as `{ wildcard: false, maxListeners: 10 }`.

- `wildcard: false` — `'course.*'` patterns do **not** work. Subscribe to the exact event name.
- `maxListeners: 10` — per event. As modules grow this is a real ceiling; a silent warning at 11.
- Event names are dotted and past-tense: `course.completed`, `user.created`, `notification.persisted`.
- **Emit after the transaction commits.** A listener that queries the DB will otherwise read
  pre-commit state. Collect payloads inside `transactional()`, emit after it resolves.
- Listeners live in the **consuming** module (`modules/mail/listeners/mail.listener.ts`), never
  beside the emitter. The emitter must not know who listens.
- A listener that does real work should enqueue a job, not do the work inline — otherwise a slow
  mail send blocks the HTTP response.

## Bull v4 (not BullMQ)

`@nestjs/bull` v11 + `bull` v4. The API differs from BullMQ — `Queue.add(name, data)`,
`@Processor(QUEUE)` with `@Process(name)` handlers. Do not copy BullMQ examples (`Worker`,
`QueueEvents`, `connection:`); they will not work here.

```typescript
// module
BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),

// enqueue at the feature site
@InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue<JobData>
await this.queue.add('phase-unlocked', { traineePhaseId });
```

Queues in use: `MAIL_QUEUE`, `SLACK_QUEUE`, `NOTIFICATIONS_QUEUE`, plus the review-calendar queue.
Processors sit at module root: `mail.processor.ts`, `slack.processor.ts`.

Rules:

- **An HTTP handler never blocks on an external call.** Enqueue and return.
- **Handlers must be idempotent.** A job can run twice (retry, redeploy mid-run). Key on a stable
  id and check "already sent / already exists" before acting, rather than assuming exactly-once.
- Job payloads must be **plain serialisable data** — ids, not entities. The entity you loaded is
  stale by the time the job runs; re-fetch inside the handler.
- Set explicit retry/backoff on jobs that hit a flaky third party; don't rely on the default.
- A permanently failing job should fail loudly (log with `redact()`), not swallow. Never
  `catch {}` in a processor.
- Redis connection comes from `REDIS_HOST` / `REDIS_PORT` (defaults `localhost:26379`). Queues
  require Redis up — `docker compose up -d` before testing anything queue-backed.

## Cron

`ScheduleModule.forRoot()` is global. Existing jobs:

```typescript
@Cron('30 0 * * *', { timeZone: VIETNAM_TIMEZONE })          // auto-complete overdue phases
@Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: VIETNAM_TIMEZONE })  // WSM working-time sync
@Cron(CronExpression.EVERY_DAY_AT_2AM, { timeZone: VIETNAM_TIMEZONE })  // WSM user sync
@Cron(CronExpression.EVERY_DAY_AT_3AM)                        // slack / mail / calendar queue cleanup
```

- **Always pass `{ timeZone: VIETNAM_TIMEZONE }`** on anything whose *business meaning* is a
  Vietnam calendar day. Note the 3AM cleanup jobs currently omit it — that's an existing
  inconsistency, not a pattern to copy.
- A cron that enqueues per-user work should enqueue jobs, not do the work in the tick. The tick
  should be short and crash-safe.
- Cron fires on **every** running instance. With more than one instance you get duplicate work —
  guard with a DB claim/lock or a Redis key if the job isn't naturally idempotent.
- Digest-style reminders compute a **negative set** ("who hasn't submitted") — that means an empty
  result is a valid successful run, not a bug. Log the count either way.
- Skip weekends and holidays where the business rule says so; that logic already exists for the
  ChatWork digest — reuse it rather than re-deriving.

## Choosing

- Needs to happen before the response returns and affects the response → do it inline.
- Must happen, but the user shouldn't wait, and failure needs retry → **queue**.
- Another module needs to know something happened, in-process → **event** (which usually enqueues).
- Happens on a schedule, not in response to a request → **cron** (which usually enqueues).
