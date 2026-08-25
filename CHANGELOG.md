# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-08-25

### Added
- **Epic 1.1: Project Management & Health Score**:
  - `CalculateProjectHealthUseCase`, `ListProjectsUseCase`, `GetProjectByIdUseCase`, `DeleteProjectUseCase` (`03_backend`).
  - Real-time `ProjectHealthGauge` with overall score (0-100), status classification (`EXCELLENT`, `HEALTHY`, `NEEDS_ATTENTION`, `AT_RISK`), and progress/momentum/risk breakdown (`04_frontend`).
  - Full project CRUD web dashboard (`/projects`) and `CreateProjectModal` (`04_frontend`).
- **Epic 1.2: Contextual Task Management**:
  - Task State Machine inside `TaskEntity` with transition validator across `INBOX`, `PLANNED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `ARCHIVED` (`03_backend`).
  - Interactive **Kanban Board** (`TaskKanbanBoard`) with 1-click status transitions and **List View** (`TaskList`) (`04_frontend`).
  - `CognitiveLoadBadge` with 1-5 mental energy indicator and external `TaskSourceVO` linking for GitHub PRs/issues and Calendar meetings (`04_frontend`).
  - `TransitionTaskStatusUseCase` and `/api/v1/tasks/:id/transition` endpoint (`03_backend`).
- **Epic 1.3: Data Ingestion Connectors (GitHub & Google Calendar)**:
  - `GitHubConnectorAdapter` with commit ingestion, PR tracking, and bottleneck PR detector (> 20h without review alert) (`03_backend`).
  - `GoogleCalendarConnectorAdapter` with meeting sync, meeting minutes calculation, and free deep work slot detection (`03_backend`).
  - Inbound use cases `SyncGitHubActivityUseCase` and `SyncCalendarScheduleUseCase` with REST endpoints (`03_backend`).
  - Deterministic Mock Fallback layer enabling full operational readiness without requiring immediate API keys (`03_backend`).
- **Epic 1.4: Command Center & Today Dashboard**:
  - `DailyFocusSelector` for pinning and tracking completion of Top 3 Daily Priorities (`04_frontend`).
  - `UnifiedScheduleTimeline` integrating calendar meetings with deep work blocks and Google Meet join triggers (`04_frontend`).
  - `LiveActivityFeed` providing real-time streaming timeline of commits, PRs, and task events (`04_frontend`).
  - Today use cases: `SetDailyFocusUseCase`, `GetDailyFocusUseCase`, `ToggleDailyFocusTaskUseCase`, `GetDailyScheduleUseCase`, `GetActivityTimelineUseCase` (`03_backend`).
- **Documentation & Setup**:
  - `docs/guides/THIRD_PARTY_CONNECTORS_SETUP.md` detailing step-by-step manual setup for GitHub Personal Access Tokens and Google Calendar OAuth 2.0 (`06_docs_changelog`).
  - Completed Phase 1 plan `docs/plans/completed/phase-1-productivity-core.md` (`06_docs_changelog`).

### Quality & Invariants
- 109 automated tests passing across 19 suites (`05_reviewer_tester`).
- Achieved **99.03% Statement**, **95.24% Branch**, **100.00% Function**, **99.03% Line** test coverage, strictly satisfying the `> 95%` invariant (`05_reviewer_tester`).
- Clean Architecture boundaries preserved with 0 framework imports in `src/core/domain`.

---

## [0.1.0] - 2026-08-24

### Added
- **Monorepo Foundation**: Turborepo, pnpm workspaces (`@personal-os/types`, `@personal-os/shared`, `@personal-os/config`, `@personal-os/api`, `@personal-os/web`).
- **Clean Architecture Core**: Domain entities (`User`, `Project`, `Task`, `Event`, `Decision`, `Recommendation`, `Notification`, `AuditLog`), Value Objects (`CognitiveLoad`, `ProjectHealthVO`, `TaskSourceVO`), Domain Events.
- **Infrastructure**: PostgreSQL 16 with `pgvector`, Redis 7, Prisma ORM schema, AES-256-GCM crypto service, JWT authentication service, EventEmitter Event Bus.
- **Design System**: Romer Design Tokens (`DESIGN_TOKEN.md`) with Tailwind CSS dark palette and glassmorphism.
- **Testing**: Vitest test runner with 72 automated test suites (97.83% coverage).
