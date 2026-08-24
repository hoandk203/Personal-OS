# Personal OS — Product Documentation

Thư mục này chứa tài liệu đặc tả sản phẩm, kiến trúc kỹ thuật và phân rã các tính năng (Epics & User Stories) của dự án **Personal OS**.

## 📑 Danh mục tài liệu

1. **[Product Overview & Principles](overview.md)**:
   - Tầm nhìn sản phẩm, triết lý cốt lõi, persona và 5 nguyên tắc bất biến (Context over Objects, Action over Information, Human-in-the-loop, Event-driven, Explainability).
2. **[Technical Architecture & Strategy](architecture.md)**:
   - Kiến trúc Monorepo, **Clean Architecture (Hexagonal Architecture / Ports & Adapters)** cho backend (`apps/api`), Web Client (Next.js), Database Strategy (Postgres + pgvector + Redis), và AI Context Pipeline.
3. **[Epics & User Stories Breakdown](epics-and-stories.md)**:
   - Phân rã chi tiết toàn bộ tính năng theo 7 giai đoạn (Phase 0 đến Phase 6), danh sách User Stories theo chuẩn Clean Architecture kèm Acceptance Criteria (AC) và ma trận bàn giao giữa 7 Sub-Agents.
4. **[Architectural Decisions (ADRs)](../decisions/)**:
   - [ADR 0001: Adopt Clean Architecture for Backend](../decisions/0001-adopt-clean-architecture.md).
5. **[Original Specification v0.1](../../Personal%20OS%20%E2%80%94%20Product%20&%20Technical%20Specification%20v0.1.md)**:
   - Bản đặc tả kỹ thuật gốc đầy đủ của Personal OS.

---

## 🎯 Quy tắc cập nhật tài liệu

Khi có thay đổi về tính năng, quyết định kỹ thuật hoặc luồng nghiệp vụ:
- Cập nhật tài liệu domain tương ứng trong thư mục này.
- Ghi nhận Architectural Decision Record (ADR) trong `docs/decisions/` nếu thay đổi kiến trúc hoặc công nghệ.
- Bổ sung Acceptance Criteria trong [epics-and-stories.md](epics-and-stories.md).
