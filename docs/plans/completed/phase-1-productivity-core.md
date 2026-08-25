# Execution Plan: Phase 1 — Productivity Core (MVP Focus)

Date: 2026-08-25

## Status

Completed

## Outcome

Đã xây dựng và tích hợp hoàn chỉnh toàn bộ hệ thống **Productivity Core** cho Personal OS theo chuẩn **Clean Architecture**, đáp ứng đầy đủ 4 Epics từ `1.1` đến `1.4` theo thứ tự ưu tiên số cùng bằng chứng nghiệm thu thực thi:
1. **Epic 1.1: Quản lý Project & Project Health Score** (`EPIC-010`):
   - Backend: Domain entity `ProjectEntity`, use cases `CreateProjectUseCase`, `UpdateProjectUseCase`, `ListProjectsUseCase`, `GetProjectByIdUseCase`, `DeleteProjectUseCase`, `CalculateProjectHealthUseCase`.
   - Tính toán chỉ số sức khỏe tự động đa chiều (Progress, Momentum, Schedule Risk, Blocker Risk) và xếp hạng trạng thái (`EXCELLENT`, `HEALTHY`, `NEEDS_ATTENTION`, `AT_RISK`).
   - Frontend: Trang `/projects`, `ProjectList`, `ProjectCard`, `ProjectHealthGauge`, `CreateProjectModal`.
2. **Epic 1.2: Quản lý Task Ngữ cảnh & Kanban/List View** (`EPIC-011`):
   - Backend: Task State Machine trong `TaskEntity` (`INBOX`, `PLANNED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `ARCHIVED`), use case `TransitionTaskStatusUseCase`, `TaskSourceVO` (GitHub / Calendar / Email linking), Cognitive Load validation (1-5), bộ lọc đa tiêu chí.
   - Frontend: Trang `/tasks` với chế độ xem **Kanban Board** kéo thả và **List View**, `TaskCard`, `CognitiveLoadBadge`, `CreateTaskModal`.
3. **Epic 1.3: Data Connectors (GitHub & Google Calendar Sync)** (`EPIC-012`):
   - Outbound ports: `GitHubConnectorPort`, `CalendarConnectorPort`.
   - Adapters: `GitHubConnectorAdapter` (sync commits, PRs, issues; phát hiện PR bottleneck > 20h và phát tín hiệu cảnh báo), `GoogleCalendarConnectorAdapter` (sync cuộc họp, tính meeting minutes và free time slots cho deep work).
   - Inbound use cases: `SyncGitHubActivityUseCase`, `SyncCalendarScheduleUseCase`.
   - Cơ chế Fallback & Mock dữ liệu deterministic sẵn sàng chạy ngay khi chưa có API Token.
4. **Epic 1.4: Command Center & Today Dashboard** (`EPIC-013`):
   - Use cases: `SetDailyFocusUseCase`, `GetDailyFocusUseCase`, `ToggleDailyFocusTaskUseCase`, `GetDailyScheduleUseCase`, `GetActivityTimelineUseCase`.
   - Frontend: Trang `/` (Today View) tích hợp:
     - `DailyFocusSelector`: Chọn và theo dõi tiến độ Top 3 Focus Tasks.
     - `UnifiedScheduleTimeline`: Lịch hợp nhất (Meeting blocks, Deep work blocks, Free time slots).
     - `LiveActivityFeed`: Dòng thời gian sự kiện realtime từ GitHub và tasks.
5. **Quality & Invariant Assurance**:
   - 109 automated tests qua 19 test suites, 100% tests passed.
   - Test Coverage: **99.03% Stmts**, **95.24% Branches**, **100.00% Funcs**, **99.03% Lines** (Vượt ngưỡng yêu cầu > 95%).
   - Frontend Next.js build hoàn thành 100% static page generation tuân thủ tuyệt đối `docs/design/DESIGN_TOKEN.md`.

## Context

- `AGENTS.md`: Quy chuẩn Invariant (UI Design Token, Test Coverage > 95%).
- `docs/product/epics-and-stories.md`: Đặc tả chi tiết các User Stories US-010 đến US-017 thuộc Phase 1.
- `docs/product/architecture.md`: Cấu trúc Clean Architecture & Flow dữ liệu.
- `docs/design/DESIGN_TOKEN.md`: Bảng quy chuẩn Design Token cho Web Client.
- `docs/guides/THIRD_PARTY_CONNECTORS_SETUP.md`: Hướng dẫn cấu hình kết nối bên thứ ba.
- `docs/plans/completed/phase-0-foundation.md`: Nền tảng Phase 0 đã hoàn thiện.

## Scope

In scope:
- **Backend (`apps/api`)**:
  - Use cases & Repository methods cho Projects & Health Breakdown.
  - Use cases & State Machine cho Tasks (Transition status, Link TaskSource, Filter by Project/Priority/Load).
  - Outbound Ports & Adapters cho GitHub Connector (`GitHubConnectorAdapter`) và Google Calendar (`GoogleCalendarConnectorAdapter`).
  - Use cases & REST routes cho Today Command Center (`/api/v1/today/focus`, `/api/v1/today/schedule`, `/api/v1/today/timeline`) và Connectors (`/api/v1/connectors/github/sync`, `/api/v1/connectors/calendar/sync`).
- **Frontend (`apps/web`)**:
  - API Client Layer (`apiClient.ts`) với chế độ mock fallback an toàn.
  - Trang & Components Projects: `ProjectList`, `ProjectCard`, `ProjectHealthGauge`, `CreateProjectModal`.
  - Trang & Components Tasks: `TaskKanbanBoard`, `TaskList`, `CognitiveLoadBadge`, `TaskCard`, `CreateTaskModal`.
  - Trang & Components Command Center (`/`): `DailyFocusSelector`, `UnifiedScheduleTimeline`, `LiveActivityFeed`.
  - Navigation Sidebar & Command Header.
- **Testing & Invariant Verification**:
  - Unit tests cho use cases mới, adapters mới, repositories và state machines.
  - Integration tests cho các REST API routes mới.
  - Test Coverage checks (> 95%).

Out of scope:
- Semantic Vector Search & AI RAG Context Pipeline (thuộc Phase 2).
- AI Daily Briefing LLM generation (thuộc Phase 2).
- Multi-agent autonomous tooling (thuộc Phase 6).

## Progress

- [x] Step 1: Epic 1.1 — Project Management & Health Score (Backend & Frontend UI)
- [x] Step 2: Epic 1.2 — Contextual Task Management (State Machine, Kanban & List UI)
- [x] Step 3: Epic 1.3 — Data Ingestion Connectors (GitHub & Google Calendar)
- [x] Step 4: Epic 1.4 — Command Center & Today Dashboard (Focus Top 3, Schedule & Activity Feed)
- [x] Step 5: Verification, Automated Testing (> 95% Coverage) & Final Review

## Decisions

- 2026-08-25: Triển khai tuần tự theo thứ tự số (Epic 1.1 -> Epic 1.2 -> Epic 1.3 -> Epic 1.4) để hoàn thiện từ Core Data Model đến Connectors rồi tổng hợp lên Dashboard.
- 2026-08-25: Thiết lập chế độ Deterministic Mock Fallback cho Adapters giúp ứng dụng chạy hoàn chỉnh 100% ngay cả khi người dùng chưa cấu hình API Key bên thứ ba.
- 2026-08-25: Sử dụng Optimistic UI Updates cho Kanban Board và Focus Selector để tối ưu phản hồi giao diện.

## Validation Evidence

- **Architecture Invariant Test**: `tests/invariants/clean-architecture.invariant.test.ts` (Domain hoàn toàn độc lập với third-party frameworks).
- **Unit & Integration Tests**: 109/109 tests passed across 19 test suites.
- **Coverage Metrics**:
  - Statements: `99.03%`
  - Branches: `95.24%`
  - Functions: `100.00%`
  - Lines: `99.03%`
- **Build Status**: `turbo run build` compiled 5 packages/apps successfully (Next.js static page generation: `/`, `/tasks`, `/projects`, `/_not-found`).

## Result

Phase 1 đã hoàn thành 100% mục tiêu đề ra, sẵn sàng cho Phase 2 (AI Intelligence & Context Layer).
