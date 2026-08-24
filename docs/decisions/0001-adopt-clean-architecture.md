# 0001 Adopt Clean Architecture for Backend

Date: 2026-08-24

## Status

Accepted

## Context

Ban đầu, bản đặc tả kỹ thuật dự thảo đề xuất kiến trúc Modular Monolith dựa trên NestJS modules. Tuy nhiên, để đảm bảo tính độc lập tối đa của Core Domain Logic, khả năng kiểm thử không phụ thuộc framework (Framework-agnostic), và tuân thủ chặt chẽ nguyên lý Dependency Inversion, hệ thống cần một kiến trúc phân tầng rõ ràng (Clean Architecture / Hexagonal Architecture).

## Decision

Toàn bộ backend của Personal OS (`apps/api`) sẽ được xây dựng theo chuẩn **Clean Architecture (Hexagonal Architecture / Ports & Adapters)** thay vì NestJS module thông thường:

1. **Domain Layer (`core/domain`)**:
   - Entities, Value Objects, Domain Exceptions, Domain Events.
   - Hoàn toàn thuần TypeScript, zero dependencies vào frameworks/libraries bên ngoài.
2. **Application Layer (`core/application`)**:
   - Use Cases (Interactors), Input/Output DTOs.
   - Inbound & Outbound Ports (Interfaces cho Repositories, External Services, AI Providers, Event Dispatchers).
3. **Infrastructure Layer (`infrastructure`)**:
   - Database Adapters (Prisma / PostgreSQL / pgvector Repositories thực thi outbound ports).
   - Connector Adapters (GitHub API client, Google Calendar client).
   - Queue/Worker Adapters (BullMQ, Redis).
   - AI Providers (OpenAI/Gemini adapter).
4. **Presentation / Interface Layer (`interfaces` / `presentation`)**:
   - HTTP REST Controllers, GraphQL Resolvers.
   - Webhook Handlers, CLI Commands.
   - Middlewares, Guards, Exception Filters.

## Alternatives Considered

1. **NestJS Modules (Modular Monolith)**:
   - Dễ setup ban đầu nhưng dễ gây dính chặt logic nghiệp vụ vào NestJS decorators, modules và DI container của NestJS.
2. **Layered / N-Tier Architecture (Controller -> Service -> Repository)**:
   - Thiếu tính độc lập của Domain, business logic bị lẫn vào Service và database models.

## Consequences

Positive:
- **Zero Framework Lock-in**: Domain & Use Cases hoàn toàn có thể test hoặc di chuyển mà không bị phụ thuộc vào HTTP server hay ORM.
- **High Testability**: Viết Unit Test cho Use Cases và Domain Entities 100% bằng mock/in-memory ports mà không cần khởi động database hay framework container.
- **Clear Boundaries**: Quy định rõ hướng phụ thuộc một chiều (Dependencies rule: Presentation & Infrastructure -> Application -> Domain).

Tradeoffs:
- Thêm các lớp trung gian (Ports/Interfaces và Adapters) yêu cầu mapper chuyển đổi giữa Domain Entity và Database Model / DTOs.

## Follow-Up

- Áp dụng cấu trúc thư mục Clean Architecture vào toàn bộ tài liệu product, epics và mã nguồn backend.
