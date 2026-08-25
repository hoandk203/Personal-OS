# Personal OS

> **Precision Operational Layer & Daily Decision Support Platform**  
> An executive operational system designed to reduce cognitive load, enforce deep work prioritization, track multi-project health, and provide deterministic, explainable AI daily briefings.

---

## 🏗️ Architecture & Technical Foundation

Personal OS is built on **Clean Architecture (Hexagonal Architecture / Ports & Adapters)** to enforce strict separation of concerns, framework independence, and high testability.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│    (Next.js Web App / Express Controllers / REST Routes)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ invokes
┌──────────────────────────────▼──────────────────────────────┐
│                  Core Application Layer                     │
│      (Use Cases, Inbound Ports, Outbound Port Interfaces)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ encapsulates
┌──────────────────────────────▼──────────────────────────────┐
│                    Core Domain Layer                        │
│    (Entities, Value Objects, Domain Events, Invariants)     │
└──────────────────────────────▲──────────────────────────────┘
                               │ implements ports
┌──────────────────────────────┴──────────────────────────────┐
│                  Infrastructure Layer                       │
│  (Prisma Repositories, PostgreSQL pgvector, BullMQ, Redis)  │
└─────────────────────────────────────────────────────────────┘
```

- **Core Domain Layer** (`apps/api/src/core/domain`): Pure business logic, Value Objects (`CognitiveLoad`, `ProjectHealthVO`, `TaskSourceVO`), Domain Entities (`User`, `Project`, `Task`, `Event`, `Decision`, `Recommendation`, `Notification`, `AuditLog`). Zero third-party framework dependencies.
- **Core Application Layer** (`apps/api/src/core/application`): Inbound Ports (Use Case interfaces), Outbound Ports (Repository & Adapter interfaces), and concrete Use Cases.
- **Infrastructure Layer** (`apps/api/src/infrastructure`): Prisma ORM adapters, PostgreSQL 16 with `pgvector`, Redis 7 caching, BullMQ job queues, AES-256-GCM crypto service.
- **Presentation Layer** (`apps/api/src/presentation` & `apps/web`): REST API routes, Auth middlewares, Next.js 15 App Router client styled with precision design tokens (`docs/design/DESIGN_TOKEN.md`).

---

## 📦 Monorepo Structure

```text
personal-os/
├── apps/
│   ├── api/                 # Clean Architecture Backend (Node.js/Express/Prisma/Vitest)
│   └── web/                 # Next.js 15 Client (Tailwind CSS, Design Tokens, React 19)
├── packages/
│   ├── types/               # Domain Models, Enums, DTOs, API contracts
│   ├── shared/              # Result monad, Crypto (AES-256-GCM), Error hierarchy, Loggers
│   └── config/              # Shared configs
├── docs/
│   ├── product/             # Overview, Architecture, Epics & User Stories breakdown
│   ├── design/              # DESIGN_TOKEN.md (Dark-first Design System)
│   ├── decisions/           # ADR 0001 (Clean Architecture adoption)
│   ├── plans/               # Completed & Active Execution Plans (Harness standard)
│   └── WORKFLOW.md          # Harness workflow & quality gates
├── docker-compose.yml       # PostgreSQL 16 (pgvector) + Redis 7
├── turbo.json               # Turborepo task pipeline
└── package.json             # Root monorepo scripts
```

---

## 🚀 Quickstart & Local Execution

### 1. Prerequisites
- **Node.js**: `v20+` or `v22+`
- **pnpm**: `v10+` or `v11+`
- **Docker**: For local database services

### 2. Start Databases
```bash
# Start PostgreSQL (pgvector) & Redis in background
pnpm db:up
```

### 3. Install Dependencies & Build
```bash
pnpm install
pnpm build
```

### 4. Run Development Servers
```bash
# Run both Backend API and Frontend Web concurrently
pnpm dev

# Or run individually:
pnpm api:dev    # API backend on http://localhost:4000
pnpm web:dev    # Web frontend on http://localhost:3000
```

---

## 🧪 Testing & Invariant Validation

The codebase strictly complies with the **> 95% Coverage Invariant** mandated by [`AGENTS.md`](file:///home/shinki/projects/personal-os/AGENTS.md).

```bash
# Run all 72 automated test suites
pnpm test

# Run tests with coverage report
pnpm test:coverage
```

### Coverage Report
- **Statements**: `97.83%` (Target: > 95%)
- **Statements**: `99.03%` (Target: > 95%)
- **Branches**: `95.24%` (Target: > 95%)
- **Functions**: `100.00%` (Target: > 95%)
- **Lines**: `99.03%` (Target: > 95%)

---

## 🗺️ Product Roadmap

- [x] **Phase 0: Foundation & Clean Architecture Core** (Completed)
- [x] **Phase 1: Productivity Core (MVP)** (Projects, Tasks, GitHub & Calendar Adapters, Command Center)
- [ ] **Phase 2: AI Intelligence & Daily Decision Support** (RAG, Context Engine, Explainable Recommendations)
- [ ] **Phase 3: Automation Engine & Tiered Notifications** (Event Triggers, Telegram/Slack/Email alerts)
- [ ] **Phase 4: Work Memory, Knowledge Graph & Decisions** (Decision Journal, Entity Linking)
- [ ] **Phase 5: Personal Analytics & Energy Tracking** (Cognitive Load Analytics, Burnout alerts)
- [ ] **Phase 6: Multi-Agent Extensibility** (Subagent tool calling, Webhook triggers)

---

## 📚 Documentation Index

For detailed documentation, refer to [`docs/README.md`](file:///home/shinki/projects/personal-os/docs/README.md):
- [Product & Technical Spec](file:///home/shinki/projects/personal-os/Personal%20OS%20%E2%80%94%20Product%20&%20Technical%20Specification%20v0.1.md)
- [Clean Architecture Specification](file:///home/shinki/projects/personal-os/docs/product/architecture.md)
- [Design Token System](file:///home/shinki/projects/personal-os/docs/design/DESIGN_TOKEN.md)
- [Third-Party Connectors Setup Guide](file:///home/shinki/projects/personal-os/docs/guides/THIRD_PARTY_CONNECTORS_SETUP.md)
- [Epics & User Stories Breakdown](file:///home/shinki/projects/personal-os/docs/product/epics-and-stories.md)
- [ADR 0001: Adopt Clean Architecture](file:///home/shinki/projects/personal-os/docs/decisions/0001-adopt-clean-architecture.md)
- [Phase 1 Completed Execution Plan](file:///home/shinki/projects/personal-os/docs/plans/completed/phase-1-productivity-core.md)

