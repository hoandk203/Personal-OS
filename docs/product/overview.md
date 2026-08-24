# Personal OS — Product Overview & Principles

## 1. Product Vision

**Personal OS** là hệ điều hành cá nhân hợp nhất dữ liệu từ công việc, học tập, lịch trình, dự án và hoạt động thành một **Context Layer** duy nhất.

Mục tiêu không phải tạo thêm một ứng dụng Note/Todo/Calendar, mà là giải quyết khoảng trống thông tin và hỗ trợ ra quyết định hàng ngày bằng cách trả lời 3 câu hỏi:
1. **Điều gì đang xảy ra với tôi?**
2. **Điều gì quan trọng nhất lúc này?**
3. **Tôi nên làm gì tiếp theo?**

---

## 2. Core Philosophy & Value Proposition

> **Collect Context → Reduce Cognitive Load → Recommend Action → Automate Execution → Learn from Outcomes**

Hiện tại thông tin của một người bị phân tán (GitHub, Google Calendar, Email, Notes, Task manager). Các hệ thống này biết thông tin riêng rẽ nhưng không hiểu context tổng thể (ví dụ: hôm nay có 4 cuộc họp và deadline gấp thì không nên nhận thêm commitment mới hay xếp deep-work vào giữa các cuộc họp). Personal OS là lớp trí tuệ giải quyết bài toán này.

---

## 3. Product Principles (5 Nguyên tắc bất biến)

- **P1 — Context over Objects**: Không chỉ lưu Task, Event đơn lẻ mà luôn lưu vết nguồn gốc (`Task → Project → Deadline → Email/PR nguồn → Quyết định liên quan`).
- **P2 — Action over Information**: Mọi thông tin, dashboard, insight đều phải trả lời: *Điều gì đã xảy ra? Vì sao nó quan trọng? Tôi nên làm gì tiếp theo?*
- **P3 — Human-in-the-loop**: AI tự động tóm tắt, phân tích, lập lịch. Nhưng các hành động có tác động lớn (gửi email, xóa dữ liệu, dời lịch họp) bắt buộc phải có bước xác nhận từ con người.
- **P4 — Event-driven**: Chuẩn hóa mọi thay đổi thành `Event` (`id, type, source, userId, payload, occurredAt`).
- **P5 — Explainability**: Mọi khuyến nghị của AI phải có cấu trúc: `Title`, `Reason`, `Evidence`, `Confidence`, `SuggestedAction`.

---

## 4. Non-goals (Những gì Personal OS KHÔNG làm)

- KHÔNG thay thế Google Calendar, Jira, Notion, Slack, Strava khi các ứng dụng này đã làm tốt.
- KHÔNG phải là một generic chatbot trò chuyện lan man.
- KHÔNG phải là autonomous agent toàn quyền hành động không kiểm soát.

---

## 5. Success Metrics

- **Chỉ số chính**: **Time Saved per Week** (Số giờ tiết kiệm được mỗi tuần).
- **Chỉ số phụ**:
  - Số lượng thao tác thủ công được tự động hóa.
  - Tỷ lệ chấp thuận gợi ý của AI (Recommendation acceptance rate).
  - Tỷ lệ kiểm tra Today Dashboard (>= 5 ngày/tuần).
