# ĐẶC TẢ NGHIỆP VỤ USERSERVICE (USER PROFILE MANAGEMENT)

## 1. Mục Tiêu (Purpose)
* **UserService** chịu trách nhiệm quản lý thông tin hồ sơ cá nhân mở rộng (`UserProfile`) của người dùng sau khi tài khoản đã tồn tại trong bảng `User`.
* Dịch vụ này cô lập hoàn toàn logic quản lý hồ sơ cá nhân, **không** xử lý đăng ký/đăng nhập, cấp phát token hay quản lý phiên đăng nhập (thuộc AuthService — hiện chưa triển khai), **không** xử lý hồ sơ doanh nghiệp của đối tác (thuộc AgentService).
* Ở giai đoạn hiện tại (chưa có AuthService), UserService đóng vai trò tạo bản ghi `User` gốc kèm `UserProfile` ngay khi khởi tạo tài khoản, phục vụ mục đích phát triển và kiểm thử các service khác.

---

## 2. Phân Quyền Hệ Thống (Authorization Matrix)

| Vai Trò (Role) | Phạm Vi Quyền Hạn (Scope) |
| :--- | :--- |
| **User** | Quyền CRUD giới hạn: Chỉ được Đọc, Sửa hồ sơ cá nhân của chính mình (khớp `userId`). |
| **Agent** | Tương tự User: được Đọc, Sửa hồ sơ cá nhân của chính mình (hồ sơ doanh nghiệp `AgentProfile` xử lý riêng ở AgentService). |
| **Admin** | Quyền Tối cao: Đọc thông tin hồ sơ của bất kỳ người dùng nào trên toàn sàn để phục vụ quản trị, khiếu nại, tra soát. |

> **Ghi chú:** Vì AuthService chưa được xây dựng, ở giai đoạn hiện tại các API của UserService tạm thời chưa gắn middleware xác thực JWT thật sự; `userId` được truyền trực tiếp qua tham số để phục vụ test. Khi AuthService hoàn thiện, toàn bộ endpoint dưới đây bắt buộc phải bổ sung middleware xác thực và đối chiếu quyền theo `role`.

---

## 3. Danh Sách Case Sử Dụng (Use Cases)

### 3.1. Quản Lý Tài Khoản & Hồ Sơ Cơ Bản

#### UC01 - Khởi Tạo Tài Khoản Kèm Hồ Sơ
* **Actor:** User (giai đoạn hiện tại: gọi trực tiếp, sau này AuthService sẽ gọi nội bộ sang UserService khi đăng ký thành công).
* **Mô tả:** Tạo mới bản ghi `User` (với `role = USER`, `status = PENDING`) và bản ghi `UserProfile` liên kết trong cùng một giao dịch (transaction).
* **Điều kiện tiên quyết:** Email chưa từng tồn tại trên hệ thống (ràng buộc `unique` trên `User.email`).
* **Luồng xử lý chính:**
  1. Nhận `email`, `fullName` (bắt buộc), `phoneNumber` (tuỳ chọn).
  2. Validate dữ liệu đầu vào.
  3. Tạo bản ghi `User` và `UserProfile` lồng nhau (nested write) trong một transaction duy nhất — đảm bảo không phát sinh `User` mồ côi không có `UserProfile`.
* **Kết quả:** Tài khoản được tạo với `status = PENDING`, chờ các bước kích hoạt sau này (xác thực email/OTP — thuộc AuthService/OtpService khi triển khai).

#### UC02 - Xem Chi Tiết Hồ Sơ Cá Nhân
* **Actor:** User / Agent (xem của chính mình), Admin (xem của bất kỳ ai).
* **Mô tả:** Lấy thông tin `User` kèm `UserProfile` liên kết theo `userId`.
* **Dữ liệu hiển thị:** `email`, `role`, `status`, `fullName`, `phoneNumber`, `avatarUrl`, `address`, `createdAt`.

#### UC03 - Cập Nhật Hồ Sơ Cá Nhân
* **Actor:** User / Agent.
* **Điều kiện tiên quyết:** Hồ sơ thuộc quyền sở hữu của chính người yêu cầu (khớp `userId`).
* **Nghiệp vụ:** Chỉ cho phép chỉnh sửa các trường `fullName`, `phoneNumber`, `avatarUrl`, `address`. **Không** cho phép tự đổi `email`, `role`, `status` thông qua API này (các trường này do AuthService/AdminService quản lý).

#### UC04 - Cập Nhật Ảnh Đại Diện (Avatar)
* **Actor:** User / Agent.
* **Mô tả:** Cập nhật riêng trường `avatarUrl` sau khi ảnh đã được upload thành công qua MediaService (khi triển khai). UserService chỉ nhận URL trả về, không tự xử lý logic upload file.

#### UC05 - Xem Danh Sách Người Dùng
* **Actor:** Admin.
* **Tính năng hỗ trợ:** Bắt buộc phân trang (`page`, `limit`), hỗ trợ lọc theo `role`, `status`, tìm kiếm cơ bản theo `email`/`fullName`.

---

## 4. Quy Tắc Nghiệp Vụ Hệ Thống (Business Rules)

### Quy tắc khối Tài Khoản (User Rules)
* **BR01:** Email (`email`) là bắt buộc, phải đúng định dạng và duy nhất trên toàn hệ thống.
* **BR02:** Mọi tài khoản `User` khi khởi tạo đều mang trạng thái mặc định là `PENDING`.
* **BR03:** Một bản ghi `User` luôn phải có đúng một bản ghi `UserProfile` liên kết (quan hệ 1-1 bắt buộc) — không được phép tồn tại `User` mà thiếu `UserProfile`.
* **BR04:** Việc tạo `User` và `UserProfile` phải được thực hiện trong cùng một transaction; nếu bước tạo `UserProfile` thất bại, toàn bộ giao dịch phải rollback, không tạo `User` mồ côi.

### Quy tắc khối Hồ Sơ Cá Nhân (Profile Rules)
* **BR05:** Họ tên đầy đủ (`fullName`) không được phép rỗng hoặc để trống.
* **BR06:** Số điện thoại (`phoneNumber`), nếu có nhập, phải là duy nhất trên toàn hệ thống — không cho phép 2 tài khoản khác nhau dùng chung một số điện thoại.
* **BR07:** Người dùng chỉ có đặc quyền can thiệp dữ liệu (Read/Update) trên hồ sơ của chính mình, không được xem hoặc sửa hồ sơ của người dùng khác (trừ Admin).
* **BR08:** Trường `email`, `role`, `status` là các trường thuộc phạm vi quản lý của AuthService/AdminService; UserService **không** cung cấp API cho phép người dùng tự thay đổi các trường này.
* **BR09:** Trường `avatarUrl` phải là một đường dẫn URL hợp lệ, chỉ được cập nhật sau khi có phản hồi thành công từ MediaService.

---

## 5. Danh Mục Mã Lỗi Hệ Thống (Exceptions Matrix)

| Mã Lỗi (Exception Code) | Trạng Thái HTTP (Status) | Nội Dung / Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- |
| `USER_NOT_FOUND` | 404 Not Found | Không tồn tại người dùng ứng với `userId` yêu cầu. |
| `EMAIL_ALREADY_EXISTS` | 400 Bad Request | Email đã được đăng ký trên hệ thống (vi phạm BR01). |
| `PHONE_NUMBER_DUPLICATED` | 400 Bad Request | Số điện thoại đã tồn tại trên hệ thống (vi phạm BR06). |
| `INVALID_AVATAR_URL` | 400 Bad Request | Đường dẫn ảnh đại diện không hợp lệ (vi phạm BR09). |
| `PROFILE_CREATION_FAILED` | 500 Internal Server Error | Lỗi phát sinh trong quá trình tạo đồng thời `User` và `UserProfile` (vi phạm BR04, cần rollback). |
| `ACCESS_DENIED` | 403 Forbidden | Tài khoản không có quyền can thiệp vào hồ sơ của người dùng khác. |

---

## 6. Kiến Trúc Danh Sách API Dự Kiến (API Endpoints Layout)

### 6.1. Phân Hệ Tài Khoản & Hồ Sơ (User Profile Endpoints)
* `POST   /api/v1/users` : Khởi tạo tài khoản kèm hồ sơ cá nhân (Mặc định `PENDING`).
* `GET    /api/v1/users` : Lấy danh sách người dùng (Chỉ Admin, có phân trang, lọc theo `role`/`status`).
* `GET    /api/v1/users/me` : Người dùng xem hồ sơ cá nhân của chính mình.
* `GET    /api/v1/users/{userId}` : Admin xem chi tiết hồ sơ của một người dùng cụ thể.
* `PUT    /api/v1/users/me` : Người dùng cập nhật thông tin hồ sơ cá nhân của chính mình.
* `PATCH  /api/v1/users/me/avatar` : Cập nhật riêng ảnh đại diện.

---

## 7. Ghi Chú Định Hướng Phát Triển Tiếp Theo
* Các use case liên quan đến **Wishlist** (danh sách khách sạn yêu thích) và **Booking History** (lịch sử đặt phòng) đã nêu trong tài liệu tổng quan hệ thống sẽ được bổ sung ở giai đoạn sau, khi HotelService và BookingService đã có dữ liệu để liên kết.
* Khi AuthService được triển khai, cần rà soát lại toàn bộ UC01 (chuyển logic tạo `User` gốc sang AuthService, UserService chỉ còn nhận sự kiện và tạo `UserProfile` tương ứng) và bổ sung middleware xác thực thực sự cho các endpoint còn lại.
