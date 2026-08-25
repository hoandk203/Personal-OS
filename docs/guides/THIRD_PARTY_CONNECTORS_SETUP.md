# Third-Party Data Connectors Setup Guide (GitHub & Google Calendar)

Tài liệu này hướng dẫn chi tiết các bước **cấu hình thủ công** để liên kết Personal OS với các dịch vụ bên thứ ba (**GitHub** và **Google Calendar**).

---

## 🚀 1. Chế độ Hoạt động Sẵn sàng (Zero-Setup Fallback)

Hệ thống đã được thiết kế sẵn cơ chế **Deterministic Fallback Layer**:
- Khi bạn chưa cấu hình API Key/Token hoặc đang phát triển offline, hệ thống tự động cung cấp dữ liệu giả lập chuẩn xác (Commits, Pull Requests nghẽn > 20h, cuộc họp Google Meet và các khung giờ Deep Work) để toàn bộ UI và State Machine hoạt động trơn tru 100%.
- Khi bạn cung cấp Token hợp lệ, hệ thống sẽ chuyển sang chế độ gọi API thực tế và đồng bộ dữ liệu trực tiếp.

---

## 🐙 2. Hướng dẫn Liên kết GitHub (GitHub Connector)

### Cách 1: Sử dụng Personal Access Token (PAT) — *Khuyến nghị cho Personal OS*

1. Truy cập vào GitHub: [GitHub Developer Settings > Personal access tokens (classic)](https://github.com/settings/tokens).
2. Nhấn **Generate new token (classic)**.
3. Đặt tên Note: `Personal OS Local Connector`.
4. Chọn Expiration (ví dụ: `90 days` hoặc `No expiration`).
5. Chọn các quyền (Scopes) tối thiểu sau:
   - `repo` (hoặc `repo:status`, `public_repo` nếu chỉ dùng cho public repo).
   - `read:user` & `user:email`.
   - `read:org` (nếu cần theo dõi repo trong Organization).
6. Nhấn **Generate token** và sao chép mã token (dạng `ghp_xxxxxxxxxxxxxxxxxxxx`).
7. Cấu hình vào file `.env` ở root hoặc `apps/api/.env`:
   ```env
   GITHUB_ACCESS_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### Cách 2: Sử dụng GitHub OAuth App (Cho luồng Web Login)

1. Truy cập [GitHub OAuth Apps](https://github.com/settings/developers).
2. Nhấn **New OAuth App**.
3. Điền thông tin:
   - **Application name**: `Personal OS`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:4000/api/v1/connectors/github/callback`
4. Lấy `Client ID` và tạo `Client Secret`.
5. Cấu hình vào `.env`:
   ```env
   GITHUB_CLIENT_ID="Iv1.xxxxxxxxxxxx"
   GITHUB_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

---

## 📅 3. Hướng dẫn Liên kết Google Calendar (Calendar Connector)

### Bước 1: Tạo Google Cloud Project & Kích hoạt API

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo dự án mới: `Personal-OS-Connector`.
3. Vào mục **APIs & Services > Library**.
4. Tìm kiếm **Google Calendar API** và nhấn **Enable**.

### Bước 2: Cấu hình Màn hình Đồng ý (OAuth Consent Screen)

1. Vào **APIs & Services > OAuth consent screen**.
2. Chọn User Type là **External** (hoặc Internal nếu dùng Google Workspace cá nhân).
3. Điền App Name: `Personal OS`, User support email, Developer contact email.
4. Ở bước **Scopes**, thêm các phạm vi quyền:
   - `https://www.googleapis.com/auth/calendar.readonly` (Xem lịch)
   - `https://www.googleapis.com/auth/calendar.events.readonly` (Xem sự kiện & thời gian họp)
5. Thêm tài khoản Google của bạn vào danh sách **Test Users**.

### Bước 3: Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services > Credentials**.
2. Nhấn **Create Credentials > OAuth client ID**.
3. Chọn Application type: **Web application**.
4. Thêm Authorized redirect URIs:
   - `http://localhost:4000/api/v1/connectors/calendar/callback`
   - `http://localhost:3000/api/auth/callback/google`
5. Nhấn **Create** và lưu lại `Client ID` cùng `Client Secret`.
6. Cấu hình vào file `.env`:
   ```env
   GOOGLE_CLIENT_ID="xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
   GOOGLE_CALENDAR_ID="primary"
   ```

---

## 🔒 4. Cơ chế Bảo mật Dữ liệu & Mã hóa Token

Mọi access token và refresh token của bên thứ ba khi lưu trữ vào hệ thống đều được tự động **mã hóa AES-256-GCM** qua tầng Crypto của Personal OS (`packages/shared/src/crypto/token-crypto.ts`).
- Master key mã hóa được quản lý qua biến môi trường `ENCRYPTION_MASTER_KEY` (32-byte hex).
- Hệ thống không bao giờ lưu trữ hoặc trả về raw token qua REST API endpoints.

---

## 🧪 5. Kiểm tra Kết nối

Sau khi cấu hình, bạn có thể kiểm tra trực tiếp qua giao diện Command Center (`/` hoặc `/tasks`):
1. Nhấn nút **GitHub** trên thanh Header để kích hoạt đồng bộ commit & PR mới nhất.
2. Nhấn nút **Calendar** để tải lịch họp và tính toán các block Deep Work trong ngày.
3. Hoặc gửi HTTP Request:
   ```bash
   curl -X POST http://localhost:4000/api/v1/connectors/github/sync \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
     -H "Content-Type: application/json"
   ```
