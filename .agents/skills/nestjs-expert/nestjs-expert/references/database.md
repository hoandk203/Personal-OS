# Database — MikroORM v7 + PostgreSQL 18

Read before: adding/changing an entity, writing a migration, or touching a query that runs on a
list endpoint.

## Entities

37 entities in `src/database/entities/`, all extending `BaseEntity`:

```typescript
export abstract class BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuidv7()' }) id!: string;
  @Property({ type: 'Date', onCreate: () => new Date(), defaultRaw: 'now()' }) createdAt: Date = new Date();
  @Property({ type: 'Date', onCreate: () => new Date(), onUpdate: () => new Date() }) updatedAt: Date = new Date();
}
```

Note the import path: `@mikro-orm/decorators/legacy`. v7 moved decorators; follow the existing
imports rather than what MikroORM's current docs show.

- **UUID v7 PKs come from Postgres**, not the app. Never generate an id in TypeScript.
- **Soft delete** is a plain nullable `isDeleted?: boolean` — there is no global filter, so it is
  your job in every query (see SKILL.md §2.2).
- **Enums**: declare a TS enum in the entity file and export it; DTOs and ports import it from
  there (e.g. `TraineeCourseStatus`). Do not duplicate the union in the DTO.

## Repository shape and the cast idiom

Repositories take `EntityManager` from `@mikro-orm/postgresql` by constructor and implement a
domain port.

```typescript
@Injectable()
export class TraineeCoursesRepository implements TraineeCoursesRepositoryPort {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<TraineeCourseEntity | null> {
    return this.em.findOne(
      TraineeCourseEntity,
      { id, isDeleted: false } as FilterQuery<TraineeCourseEntity>,
      { populate: ['traineePhase', 'course'] as never },
    );
  }
}
```

The `as FilterQuery<T>` on `where` and `as never` on `populate` / `orderBy` are a **deliberate,
repo-wide workaround** for MikroORM v7's deep generic inference. Follow it. Do not "clean it up"
into `any` (banned by `CLAUDE.md`) and do not drop the cast — `tsc` fails without it.

## Writes

```typescript
// create
const entity = new TraineeCourseEntity();
entity.course = this.em.getReference(CourseEntity, data.courseId);  // relation without a SELECT
this.em.persist(entity);
await this.em.flush();

// update — mutate a managed entity, then flush
const e = await this.em.findOneOrFail(Entity, { id, isDeleted: false } as FilterQuery<Entity>);
e.status = TraineeCourseStatus.COMPLETED;
e.completedAt = at;
await this.em.flush();
```

`findOneOrFail` in a mutation is the house style — it throws rather than silently no-op'ing on a
missing row. Prefer `getReference` over `findOne` whenever you only need to set a foreign key.

## Indexes live in migrations, not decorators

**This is the repo's convention and it is easy to get wrong.** There are 46 hand-written
`create index` statements in `src/database/migrations/` and exactly **one** `@Index()` decorator in
all 37 entities. Naming is `idx_<table>_<columns>`:

```sql
create index "idx_courses_division_id" on "courses" ("division_id");
create index "idx_courses_is_template_division" on "courses" ("division_id", "is_template");
create index "idx_cm_ordering" on "course_modules" ("course_id", "ordering");
```

Rules:

- Adding a new query path that filters or sorts on a column → **add the index to the migration by
  hand**. Don't add `@Index()` to the entity; it diverges from the convention and the generator's
  output won't match the rest of the tree.
- Postgres does **not** auto-index foreign keys. Every new FK that gets filtered on needs its own
  `idx_<table>_<fk>_id`.
- Composite index column order matters: most selective / equality columns first, range or sort
  column last. `("division_id", "is_template")` serves `WHERE division_id = ? AND is_template = ?`
  and `WHERE division_id = ?`, but **not** `WHERE is_template = ?` alone.
- Cursor pagination sorts by `id DESC` — a composite `(filter_col, id)` index is what keeps it
  cheap once a table grows.

`@Unique({ properties: [...] })` **is** used on entities (11 unique indexes), for genuine business
keys: `('course', 'module')`, `('course', 'ordering')`, `('user', 'division')`,
`('division', 'type', 'version')`. Use the decorator for uniqueness, the migration for performance.

**Soft delete vs unique**: a plain unique constraint blocks re-creating a row you soft-deleted. The
repo's answer is the restore pattern (`findDeletedByPhaseAndCourse` → `restore`), not a partial
index. Follow it unless you have a reason not to.

## Migrations

```bash
pnpm --filter api-server db:generate   # then HAND-TRIM the output
pnpm --filter api-server db:migrate
```

- The generator emits **unrelated schema drift** for tables you didn't touch. Read the diff line by
  line and delete everything that isn't your change. Committing an untrimmed migration is how you
  break someone else's local DB.
- Migrations must be **forward-only and safe on populated tables**: a new `NOT NULL` column needs a
  default or a backfill step; renames need a two-step (add → backfill → drop) if anything reads the
  old name.
- Never edit an already-applied migration. Add a new one.
- Data backfills belong in a migration too, not in a one-off script that only ran on your machine.

## Transactions

```typescript
await this.em.transactional(async (em) => {
  // all writes that must succeed or fail together
});
```

- **Never emit an event or enqueue a Bull job inside the transaction.** A listener that reads the
  DB can observe pre-commit state. Collect the payloads, emit after `transactional()` resolves.
- Use the `em` handed to the callback for writes inside it, not the outer `this.em`.
- Reordering-style operations (`course_modules.ordering`) run in a transaction because the unique
  constraint `('course', 'ordering')` would otherwise trip mid-update. Look at
  `course-modules.repository.ts` before writing another reorder.
- Read-modify-write on a counter or a status machine is a race under concurrency. Either do it in
  one UPDATE with a WHERE guard on the old value, or take a row lock. The codebase mostly assumes
  low concurrency — if your feature breaks that assumption, say so.

## Query cost

- `populate` only the paths the response DTO actually reads. Deep chains like
  `traineePhase.mentor.user` are the main cost in list endpoints.
- For "stats per row" use one `$in` query and aggregate in JS (`countModuleStatsForMany`), not a
  query per row.
- `em.count()` on a filtered set is a second full scan — the cursor pagination code deliberately
  strips the cursor clause from the count. Keep that split if you copy the pattern.
- `debug: true` is on whenever `NODE_ENV !== 'production'` — read the SQL it prints instead of
  guessing what MikroORM generated.

## Timezone

Postgres columns are timestamps; `VIETNAM_TIMEZONE` (`Asia/Ho_Chi_Minh`) lives in
`src/common/constants.ts` and date helpers in `src/common/utils/date.util.ts`.

Known hazard: some historical migrated data was written as Vietnam-local time stored as UTC,
producing a double `+7h` offset in attendance calculations. When you write anything that compares
or buckets timestamps by day, be explicit about which timezone the boundary is in, and say in your
reply which assumption you used.
