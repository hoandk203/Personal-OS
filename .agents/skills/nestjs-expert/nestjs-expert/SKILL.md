---
name: nestjs-expert
description: Use when building or reviewing anything in apps/api-server — the Zinza LMS NestJS backend. Covers the hexagonal module layout (domain/application/infrastructure/presentation), MikroORM v7 repositories, use-cases with role scoping, class-validator DTOs + Swagger, domain exceptions with stable error codes, pagination, Bull queues and EventEmitter2; references/ covers database & migrations, API contract design, security & authorization, async jobs/cron, and logging; scripts/ enforces the error-code contract and Swagger coverage. Keywords: NestJS, Nest, api-server, module, controller, use-case, port, repository, DTO, guard, MikroORM, migration, index, transaction, queue, cron, webhook, endpoint, backend.
license: MIT
metadata:
  author: SkillsMP Community + NestJS Official Docs, adapted for zinza-lms
  version: "3.1.0-lms"
  adapted: "2026-07-23"
---

# NestJS Expert — Zinza LMS

Backend guide for `apps/api-server`. Every rule was verified against the codebase, not copied from
a generic NestJS tutorial. This file is the routing layer: it holds the architecture you need in
every task, and points at a reference for everything else.

## This skill is a baseline, not a ceiling

- **Precedence**: existing code → `CLAUDE.md` → this skill → general NestJS knowledge.
- If this skill is silent on something (index coverage, race conditions, idempotency, timezone
  handling), **still apply the right practice**. Silence ≠ permission to skip.
- Verify against `package.json` before trusting any version-specific claim here.
- When you override something in this file, say so in your reply.

## Deep references — read on demand

Open the matching reference **before** working in that area.

| File | Read it before |
| --- | --- |
| `references/database.md` | Entities, migrations, indexes, transactions, the cast idiom, query cost, timezone |
| `references/api-design.md` | Endpoints, controllers, DTOs, status codes, domain exceptions, the hand-mirrored client contract |
| `references/security.md` | Anything reading another user's data, file access, integrations/secrets, webhooks |
| `references/async-jobs.md` | Events, Bull queues, cron, notifications, anything calling an external service |
| `references/observability.md` | Logging, error handling, background features whose failure could be silent |

## Enforcement — run these, don't eyeball it

```bash
bash .claude/skills/nestjs-expert/scripts/check-error-codes.sh   # 3-way error-code contract
bash .claude/skills/nestjs-expert/scripts/check-swagger.sh       # @ApiOperation/@ApiResponse/ParseUUIDPipe
```

Both exit non-zero on findings and print the fix. `check-error-codes.sh` catches the one failure
mode `tsc` on api-server will *not* show you: a code added here that breaks the **web-client** build.

## Stack reality check

| Thing | Reality in this repo |
| --- | --- |
| ORM | **MikroORM v7** — no TypeORM, no Prisma. `EntityManager` from `@mikro-orm/postgresql`. |
| Queue | **Bull v4** via `@nestjs/bull` v11 — **not** BullMQ. `@Processor` / `@InjectQueue`. |
| Events | `@nestjs/event-emitter` v3 — `wildcard: false`, `maxListeners: 10`. |
| Adapter | Express (default). No Fastify, no `compression`. |
| Rate limit | `ThrottlerGuard` already global in `app.module.ts` — `[{ ttl: 60_000, limit: 30 }]`. |
| Helmet | **Not installed.** Propose it, don't silently add it. |
| Hashing | `bcryptjs` (not `bcrypt`), 12 rounds, wrapped in `BcryptHashingService`. |
| Tests | **Do not write unit tests** unless explicitly asked (`CLAUDE.md`). Ignore advice to add specs. |
| Prefix | Global `api` prefix; Swagger at `/api/docs`. |

---

## 1. Hexagonal layering (CRITICAL)

`src/modules/<name>/` always splits into four layers. Dependencies point **inward only**:
presentation → application → domain ← infrastructure.

```
domain/
  <name>.tokens.ts        # export const X_REPOSITORY = Symbol('X_REPOSITORY')
  <name>.exceptions.ts    # NestJS exceptions + withCode(...)
  ports/*.port.ts         # interfaces only — no NestJS, no MikroORM imports
application/
  use-cases/*.use-case.ts # one class, one `execute()`; injects ports by token
  services/*.service.ts   # multi-use-case orchestration shared inside the module
infrastructure/
  repositories/*.repository.ts  # implements the port with EntityManager
  services/*.service.ts         # S3, mail, encryption, hashing adapters
presentation/
  controllers/*.controller.ts   # HTTP only; maps DTO ⇄ use-case; no business rules
  dtos/*.dto.ts                 # class-validator + @ApiProperty (+ mapper functions)
<name>.module.ts          # wires { provide: TOKEN, useClass: Impl }
```

### 1.1 Ports are interfaces, use-cases inject the token

Never inject a concrete repository class into a use-case.

```typescript
// BAD — couples the application layer to infrastructure
constructor(private readonly repo: TraineeCoursesRepository) {}

// GOOD — application/use-cases/list-enrollments.use-case.ts
@Injectable()
export class ListEnrollmentsUseCase {
  constructor(
    @Inject(TRAINEE_COURSES_REPOSITORY)
    private readonly repo: TraineeCoursesRepositoryPort,
  ) {}

  async execute(input: ListEnrollmentsInput, actor: UseCaseActor): Promise<PagedTraineeCourses> {
    /* ... */
  }
}
```

Signature convention: `execute(input, actor)` where `actor: UseCaseActor` is `{ id, roles }` from
`@/common/authz/types`. Input shapes are plain exported interfaces in the same file; output shapes
live on the port. The application layer must **never** import from `presentation/`.

### 1.2 Entities are not domain objects

Entities live in `src/database/entities/`, extend `BaseEntity` (UUID v7 PK via
`defaultRaw: 'uuidv7()'`, `createdAt`, `updatedAt`). Ports return **entities**; the controller maps
them to response DTOs. Don't build a parallel domain-model layer. → `references/database.md`

### 1.3 Module wiring

```typescript
@Module({
  imports: [
    MikroOrmModule.forFeature([TraineeCourseEntity /* every entity the repos touch */]),
    forwardRef(() => CoursesModule), // cyclic module deps are real here — forwardRef BOTH sides
    DivisionsModule,
  ],
  controllers: [EnrollmentsController],
  providers: [
    { provide: TRAINEE_COURSES_REPOSITORY, useClass: TraineeCoursesRepository },
    ListEnrollmentsUseCase,
  ],
  exports: [TRAINEE_COURSES_REPOSITORY, EnrollCourseUseCase], // export the TOKEN, not the class
})
export class EnrollmentsModule {}
```

Cross-module reuse: import the other module and inject **its token** (e.g. `DIVISIONS_REPOSITORY`)
or its exported use-case. Never import another module's repository implementation directly.

---

## 2. Authorization & scoping (CRITICAL)

Two distinct layers — a `@Roles()` decorator alone is **not** authorization. This is the most
likely serious bug you can introduce in this codebase.

```typescript
// Guard layer: which roles may call this endpoint at all
@UseGuards(RolesGuard)
@Roles('admin', 'division_leader')

// Use-case layer: which ROWS this actor may see/touch
private async resolveScope(input, actor): Promise<Scope | null> {
  if (isGlobalReader(actor.roles)) return {};                       // admin/observer/operator/hrm
  if (actor.roles.includes(ROLE_NAMES.DIVISION_LEADER)) { /* → divisionIds */ }
  if (actor.roles.includes(ROLE_NAMES.MENTOR))          { /* → mentorIds  */ }
  if (actor.roles.includes(ROLE_NAMES.LEARNER))         { /* → own id only */ }
  return null;  // null ⇒ empty result set, NOT "unrestricted"
}
```

- `resolveScope` returning `null` must short-circuit to an **empty page**, never an unfiltered query.
- A learner passing someone else's `userId` gets scoped back to themselves — never trust a
  client-supplied owner id.
- Use `ROLE_NAMES` constants, never string literals. `hrm` exists and counts as a global reader.
- Helpers in `@/common/authz/authz.ts`: `isGlobalReader`, `isDivisionLeader`, `isMentor`,
  `canManageDivisionContent`, `canManageModuleContent`. Reuse instead of re-deriving the policy.

Full checklist, plus secrets, webhooks and uploads → `references/security.md`

---

## 3. The rest, in one line each

Each links to the reference that covers it properly — read it before working there.

- **Persistence** — `EntityManager` injected by constructor; `as FilterQuery<T>` / `as never` casts
  are a deliberate repo-wide idiom; soft delete is manual so **every** read filters `isDeleted:
  false`; indexes are hand-written in migrations, not `@Index()`. → `references/database.md`
- **Endpoints** — thin controller, `@ApiOperation` + `@ApiResponse` on every route, DTOs with
  `class-validator`, `toXxxResponseDto()` mappers, offset pagination by default and cursor for
  feed-like lists. → `references/api-design.md`
- **Errors** — `super(withCode('English message', 'ERROR_CODE'))`, then register the code in
  `shared-types` **and** translate it in the web client or that build fails.
  → `references/api-design.md`
- **Async** — emit events only *after* the transaction commits; anything external or slow goes on a
  Bull queue and must be idempotent; cron jobs that mean a Vietnam calendar day need
  `{ timeZone: VIETNAM_TIMEZONE }`. → `references/async-jobs.md`
- **Logging** — per-class `Logger`, never `console`, and every message that may carry an
  integration payload goes through `redact()`. → `references/observability.md`

---

## 4. Repo-specific traps

- **`tsx` boot gives fake DI errors.** Diagnose startup/DI failures against `dist/main` after a
  build, not the `tsx` dev entrypoint.
- **`db:generate` emits schema drift** for tables you didn't touch — trim the migration by hand.
- **`forwardRef` on both sides** or the cycle throws at boot.
- **Max 300 lines per file.** Split a fat use-case into `application/services/` helpers.
- **No `any`** — use `unknown` + narrowing, or the documented `FilterQuery<T>` / `never` casts.
- **Imports order**: node builtins → external → `@lms/*` → `@/` → relative.
- Verify claims in `lms-docs/tasks/*-plan.md` against the code — plan docs drift from reality.

---

## Definition of done

1. Four-layer structure respected; ports injected by token.
2. Guards for roles **and** scope resolution in the use-case; `null` scope ⇒ empty result, and a
   client-supplied owner id is never trusted.
3. `scripts/check-swagger.sh` clean.
4. `scripts/check-error-codes.sh` clean.
5. Entity change → generated migration, hand-trimmed; new hot query path → index added by hand.
6. Response DTO change → the hand-mirrored type in `web-client/src/lib/api/` updated in the same change.
7. Anything external/slow is queued, idempotent, and logs through `redact()`.
8. `pnpm --filter api-server exec tsc --noEmit` and `pnpm lint` clean.
9. No unit tests added unless requested.
10. Report what you applied beyond this skill, and anything you deliberately skipped.

## Still not covered anywhere — use your own judgment

Even with the references, nothing here covers: load/perf testing, caching strategy
(`@nestjs/cache-manager` is not wired up), multi-instance coordination beyond the cron note,
GDPR-style retention and deletion, or i18n of API messages. Apply what's right, and say in your
reply what you applied and what you skipped.
