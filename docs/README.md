# Documentation Map

Start with the smallest authoritative surface.

## Current Product & Architecture

- [`WORKFLOW.md`](file:///home/shinki/projects/personal-os/docs/WORKFLOW.md): request shape, planning, judgment, operation, validation, and completion standard.
- [`design/DESIGN_TOKEN.md`](file:///home/shinki/projects/personal-os/docs/design/DESIGN_TOKEN.md): design system, typography (Manrope/Inter), color tokens, dark stack architecture, and surface rules.
- [`product/architecture.md`](file:///home/shinki/projects/personal-os/docs/product/architecture.md): Clean Architecture (Hexagonal Architecture), layers (`core/domain`, `core/application`, `infrastructure`, `presentation`), data flow, and dependency inversion rules.
- [`product/overview.md`](file:///home/shinki/projects/personal-os/docs/product/overview.md): product vision, 5 invariants, core philosophy.
- [`product/epics-and-stories.md`](file:///home/shinki/projects/personal-os/docs/product/epics-and-stories.md): master breakdown of Phases 0-6, Epics, and User Stories with Acceptance Criteria.
- [`decisions/`](file:///home/shinki/projects/personal-os/docs/decisions/): Architectural Decision Records (ADRs).
  - [`0001-adopt-clean-architecture.md`](file:///home/shinki/projects/personal-os/docs/decisions/0001-adopt-clean-architecture.md): Adoption of Hexagonal / Ports & Adapters Architecture.
- [`plans/`](file:///home/shinki/projects/personal-os/docs/plans/): durable working-memory documents.
  - `active/`: current in-progress execution plans.
  - `completed/`: validated and verified completed plans ([`phase-0-foundation.md`](file:///home/shinki/projects/personal-os/docs/plans/completed/phase-0-foundation.md)).
- [`patterns/encoding-invariants.md`](file:///home/shinki/projects/personal-os/docs/patterns/encoding-invariants.md): turn accepted architecture, reliability, security, and quality rules into native mechanical validation.
- [`templates/`](file:///home/shinki/projects/personal-os/docs/templates/): decision, execution plan, runbook, and Harness improvement structures.

## System of Record

The repository's code, tests, CI, and runtime signals remain the executable truth.
All documentation adheres strictly to the Harness framework specifications.
