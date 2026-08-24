# Execution Plan: Phase 0 — Foundation & Clean Architecture Core

Date: 2026-08-24

## Status

Completed

## Outcome

Đã thiết lập hoàn chỉnh nền móng kỹ thuật và kiến trúc cho dự án Personal OS theo chuẩn **Clean Architecture** (Hexagonal Architecture / Ports & Adapters) với đầy đủ bằng chứng thực thi:
1. **Monorepo Workspace** (`pnpm` + `turborepo`) gồm:
   - `packages/types`: Domain models, Enums, DTOs, API payloads, Event schemas.
   - `packages/shared`: Result monad, Crypto & AES-256-GCM token encryption, Error hierarchy, Logger interfaces.
   - `packages/config`: Shared configs.
   - `apps/api`: Clean Architecture backend (`src/core/domain`, `src/core/application`, `src/infrastructure`, `src/presentation`).
   - `apps/web`: Next.js 15 App Router client tuân thủ 100% `docs/design/DESIGN_TOKEN.md`.
2. **Database & Infrastructure**:
   - `docker-compose.yml`: PostgreSQL 16 (với extension `pgvector`) + Redis 7.
   - `apps/api/prisma/schema.prisma`: Đầy đủ Schema cho User, Project, Task, Event, Decision, Recommendation, Notification, AuditLog, Integration.
   - Repositories: In-memory & Prisma persistence adapters, BullMQ queue adapter, EventEmitter event bus adapter.
3. **Clean Architecture Backend Core**:
   - **Domain Layer**: 8 Entities (`User`, `Project`, `Task`, `Event`, `Decision`, `Recommendation`, `Notification`, `AuditLog`), 3 Value Objects (`CognitiveLoad`, `ProjectHealthVO`, `TaskSourceVO`), Domain Events (`TaskCreatedEvent`, `TaskStatusChangedEvent`, `ProjectCreatedEvent`). Zero framework dependencies.
   - **Application Layer**: Inbound Ports (`IRegisterUserUseCase`, `IAuthenticateUserUseCase`, `ICreateTaskUseCase`, `IUpdateTaskUseCase`, `IListTasksUseCase`, `IDeleteTaskUseCase`, `ICreateProjectUseCase`, `IUpdateProjectUseCase`, `ICalculateProjectHealthUseCase`, `IIngestEventUseCase`, `IRecordAuditLogUseCase`, `IQueryAuditLogsUseCase`), Outbound Ports (`UserRepositoryPort`, `TaskRepositoryPort`, `ProjectRepositoryPort`, `EventRepositoryPort`, `AuditLogRepositoryPort`, `EventBusPort`, `TokenServicePort`).
   - **Infrastructure Layer**: InMemory repositories, AES-256-GCM token encryption, JWT token service, In-memory Queue adapter.
   - **Presentation Layer**: Express application factory, REST controllers (`/health`, `/api/v1/auth`, `/api/v1/tasks`, `/api/v1/projects`, `/api/v1/events`, `/api/v1/audit-logs`), Auth middleware, Error handling middleware (`ApiErrorResponse`).
4. **Web Client**:
   - Next.js web client được cấu hình Tailwind CSS chuẩn theo token của `DESIGN_TOKEN.md` (Electric Periwinkle `#bec2ff`, Cyan Teal `#50d8e9`, True-Black `#070708`, Manrope + Inter fonts, `inner-glow`, `card-shimmer`).
5. **Testing & Invariants**:
   - 72 automated tests qua 14 test suites.
   - Test Coverage: **97.83% Stmts**, **95.50% Branches**, **100.00% Funcs**, **97.83% Lines** (Vượt ngưỡng yêu cầu > 95%).
   - Invariant mechanical proof: Cơ chế kiểm tra tĩnh khẳng định `src/core/domain` hoàn toàn độc lập, không import bất kỳ framework nào.

## Context

- `AGENTS.md`: Quy chuẩn Harness, Invariant kiểm thử > 95%, UI Invariant theo `docs/design/DESIGN_TOKEN.md`.
- `docs/decisions/0001-adopt-clean-architecture.md`: Quyết định áp dụng Clean Architecture.
- `docs/product/architecture.md`: Kiến trúc tổng thể và cấu trúc phân tầng.
- `docs/product/epics-and-stories.md`: Đặc tả các Epics 0.1 đến 0.4.

## Scope

In scope:
- Thiết lập Monorepo (`packages/types`, `packages/shared`, `packages/config`, `apps/api`, `apps/web`).
- Docker Compose (`postgres` with pgvector, `redis`).
- Prisma Schema đầy đủ cho toàn bộ entities.
- Clean Architecture core (Domain, Use Cases, Ports, Adapters, Controllers).
- Hệ thống mã hóa token AES-256-GCM và Auth Security.
- Event Ingestion Bus và Audit Log Framework.
- Bộ test tự động (Unit, Integration, Architecture Invariant) đạt coverage > 95%.

Out of scope:
- Các Connectors chi tiết của Phase 1 (GitHub API call thực tế, Google Calendar API call thực tế - đã chuẩn bị sẵn ports).
- Giao diện chi tiết từng module của Phase 1.

## Progress

- [x] Step 1: Monorepo workspace & Docker Compose setup
- [x] Step 2: `packages/types`, `packages/shared`, `packages/config`
- [x] Step 3: `apps/api` Domain & Application layers (Clean Arch)
- [x] Step 4: `apps/api` Infrastructure & Presentation layers
- [x] Step 5: `apps/web` Design tokens & Next.js base setup
- [x] Step 6: Automated tests & Coverage verification (> 95%)
- [x] Step 7: Final review & Move plan to completed

## Decisions

- 2026-08-24: Áp dụng Clean Architecture cho backend (`apps/api`) theo ADR 0001.
- 2026-08-24: Sử dụng `vitest` và `@vitest/coverage-v8` cho test runner toàn monorepo.
- 2026-08-24: Sử dụng `pgvector/pgvector:pg16` cho vector database trong Docker Compose.

## Validation Evidence

- **Architecture Invariant Test**: `tests/invariants/clean-architecture.invariant.test.ts` (Positive & Negative proof passed).
- **Unit & Integration Tests**: 72/72 tests passed across 14 test suites.
- **Coverage Metrics**:
  - Statements: 97.83%
  - Branches: 95.50%
  - Functions: 100.00%
  - Lines: 97.83%
- **Build Status**: `turbo run build` compiled 4 packages successfully.

## Result

Phase 0 đã hoàn thành 100% mục tiêu đề ra, sẵn sàng cho Phase 1 (Productivity Core: Projects, Tasks, Connectors, Command Center).
