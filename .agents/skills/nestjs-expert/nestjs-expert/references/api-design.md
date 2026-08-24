# API design & contract

Read before: adding an endpoint, changing a response shape, or renaming anything the web client
consumes.

## The contract is typed on both ends

An API change is never one-sided. The chain is:

```
DTO in api-server  →  (manual mirror)  →  apps/web-client/src/lib/api/<resource>.api.ts
error code         →  packages/shared-types/src/error-codes.ts  →  web-client error-messages.ts
```

There is **no codegen**. Response DTO interfaces are hand-mirrored in the web client. If you change
a field name or make a field optional, grep `apps/web-client/src/lib/api/` for it and update the
mirror in the same change, or the frontend silently reads `undefined`.

## Controller shape

Thin: guards, Swagger, DTO mapping, one use-case call. No business rules.

```typescript
@ApiTags('enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  @Get()
  @ApiOperation({ summary: 'List enrollments (scope depends on actor role)' })
  @ApiResponse({ status: 200, type: CursorPaginatedEnrollmentsDto })
  async list(
    @Query() query: ListEnrollmentsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CursorPaginatedEnrollmentsDto> {
    const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
    const page = await this.listUseCase.execute({ ...query, limit }, { id: user.id, roles: user.roles });
    return { data: page.items.map(toTraineeCourseResponseDto), meta: { /* ... */ } };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'division_leader')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an enrollment (soft-delete; any status)' })
  @ApiParam({ name: 'id', description: 'TraineeCourse UUID' })
  @ApiResponse({ status: 204, description: 'Removed' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.removeUseCase.execute(id);
  }
}
```

Guards check the **role**; the use-case checks the **data scope**. Both, always — see
`references/security.md`.

Run `scripts/check-swagger.sh` to verify you didn't miss a decorator.

## DTOs

Request DTOs use `class-validator` + `@ApiProperty` / `@ApiPropertyOptional`:

```typescript
export class ListEnrollmentsQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)   // required: query params arrive as strings
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: TraineeCourseStatus })
  @IsOptional()
  @IsEnum(TraineeCourseStatus)   // enum imported from the entity, not redeclared
  status?: TraineeCourseStatus;
}
```

Response DTOs live beside them with an exported `toXxxResponseDto(entity, extra?)` mapper in the
same file. **Never return an entity straight from a controller** — that mapper is the single place
deciding what leaks.

## Pagination implementation

- **Offset** (default): `page` + `limit`, meta from `buildOffsetMeta(total, page, limit)` in
  `@/common/pagination/offset-pagination.dto`.
- **Cursor** (feed-like): `where.id = { $lt: cursor }`, `orderBy: { id: QueryOrder.DESC }`, fetch
  `limit + 1`, `pop()` the extra, `nextCursor = items[items.length - 1].id`. Strip the cursor clause
  before `em.count()` or the total is wrong.

`limit` defaults to `DEFAULT_PAGE_LIMIT` (20), capped at 100 in the DTO.

## URL & method conventions

- Global prefix `api`, resource-plural paths: `/enrollments`, `/trainee-phases`, `/courses/:id/apply`.
- `kebab-case` in paths, `camelCase` in payloads.
- Sub-resources: `/courses/:courseId/modules`. Actions that aren't CRUD get a verb suffix on POST:
  `POST /enrollments/:id/cancel`, `POST /trainee-phases/:id/unlock`.
- `PATCH` for partial update (the norm here), `PUT` only for full replacement / apply-snapshot.
- `DELETE` is a **soft delete**. If a resource also needs a "cancel" semantic, they are two
  different endpoints with different preconditions — `DELETE /enrollments/:id` removes at any
  status, `POST /enrollments/:id/cancel` only works while `assigned`. Don't collapse them.

## Status codes actually in use

| Code | When |
| --- | --- |
| 200 | GET, or a mutation that returns the updated resource |
| 201 | POST that creates — with `@HttpCode(HttpStatus.CREATED)` |
| 204 | mutation returning nothing — `@HttpCode(HttpStatus.NO_CONTENT)`, handler returns `Promise<void>` |
| 400 | validation — produced by the global pipe as `VALIDATION_FAILED`, don't throw it by hand |
| 401 | missing/expired JWT — `JwtAuthGuard` |
| 403 | authenticated but out of scope, or resource locked |
| 404 | not found, **including rows the actor may not see** (don't leak existence) |
| 409 | state-machine violation: already enrolled, not cancellable, wrong status, active phase exists |

409 vs 403 is the distinction people get wrong: 403 = "you may not", 409 = "the resource is in the
wrong state for this, and nobody could do it right now either".

## Domain exceptions

Extend the matching NestJS HTTP exception, always attaching a stable code. They live in
`domain/<name>.exceptions.ts`:

```typescript
export class EnrollmentNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(withCode(`Enrollment ${id} not found`, 'ENROLLMENT_NOT_FOUND'));
  }
}

/** Trying to enroll the same course twice into the same TraineePhase. */
export class EnrollmentConflictException extends ConflictException {
  constructor() {
    super(withCode('Course is already enrolled in this trainee phase', 'ENROLLMENT_CONFLICT'));
  }
}
```

Three steps, all required — skipping step 3 **breaks the web-client build**:

1. `withCode(message, code)` from `@/common/exceptions/error-code`. Message English, code
   UPPER_SNAKE = class name minus `Exception`.
2. Add the code to `packages/shared-types/src/error-codes.ts`.
3. Add the Vietnamese translation in `apps/web-client/src/lib/error-messages.ts` — an exhaustive
   `Record<ErrorCode, string>`.

Run `scripts/check-error-codes.sh` to verify all three are in sync in under a second.

Never swallow an error, and never return `null` where the caller expects a domain failure. Map
Postgres constraint violations through `@/common/utils/db-errors.ts` rather than string-matching.

## Query parameters

- Pagination: `page`+`limit` (offset, majority) or `cursor`+`limit` (feed-like). See SKILL.md §3.3.
- Filters are optional and additive; unknown params are **rejected** with 400 by
  `forbidNonWhitelisted: true`, so every param the client sends must exist on the DTO.
- Numeric params need `@Type(() => Number)`; booleans need `@Type(() => Boolean)` or a transform.
- Array params: the web client's `api-client` serialises arrays as repeated keys
  (`?ids=a&ids=b`) — the DTO needs `@IsArray()` and MikroORM-side `$in`.
- Never accept an owner id from a client and trust it. Scope it against the actor (SKILL.md §5).

## Response shape

- List: `{ data: T[], meta: {...} }`. Single: the DTO directly, not wrapped.
- Always map through an exported `toXxxResponseDto(entity, extra?)`. That function is the one place
  that decides what leaks — never spread an entity.
- Nullable-vs-absent: the codebase uses `field?: T` and omits it. Don't switch to `field: T | null`
  in one DTO while its neighbours omit.
- Dates go out as ISO strings; the client formats them. Never format for display server-side.
- Computed/derived fields (progress %, thumbnail URL) are assembled in the controller from a
  service (`StorageService.buildPublicUrl`) — keep the use-case returning raw data.

## Swagger completeness

`@ApiTags`, `@ApiBearerAuth` (class level), `@ApiOperation({ summary })`, `@ApiParam` per path
param, and `@ApiResponse` for **every** status the endpoint can actually return — including the
error ones, with a `description` that says why. `type:` must point at a real DTO class, not an
inline object, or the generated client/docs are useless.

Swagger is served at `/api/docs`. If your endpoint isn't fully described there, it isn't done.

## Breaking changes

Both apps deploy together, so there is no version negotiation and no `/v2` prefix. That means:

- A rename is a breaking change you must land on both sides in one commit.
- Removing a field requires checking the web client **and** any external consumer using
  `ExternalReadApiTokenGuard` / `ApiKeyGuard` (the IM-compatibility endpoints). Those have outside
  callers — treat their response shapes as frozen unless told otherwise.
- Adding an optional field is safe. Making an existing optional field required is not.
