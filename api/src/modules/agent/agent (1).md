# ĐẶC TẢ NGHIỆP VỤ AGENTSERVICE (PARTNER / MERCHANT MANAGEMENT)

## 1. Mục Tiêu (Purpose)
* **AgentService** chịu trách nhiệm quản lý toàn bộ vòng đời hồ sơ đối tác (Chủ cơ sở lưu trú / Merchant) trên hệ thống, từ lúc đăng ký gian hàng, chờ duyệt, cho đến khi được kích hoạt kinh doanh chính thức.
* Dịch vụ này cô lập hoàn toàn logic quản trị hồ sơ đối tác, **không** xử lý nghiệp vụ quản lý cơ sở lưu trú/phòng (thuộc **PropertyService**), không xử lý xác thực đăng nhập/token (thuộc AuthService).
* AgentService là điều kiện tiên quyết đầu vào cho PropertyService: một tài khoản chỉ được phép tạo cơ sở lưu trú (`UC01` bên PropertyService) khi hồ sơ Agent tương ứng đã ở trạng thái `APPROVED`.

---

## 2. Phân Quyền Hệ Thống (Authorization Matrix)

| Vai Trò (Role) | Phạm Vi Quyền Hạn (Scope) |
| :--- | :--- |
| **Guest / User** | Không có quyền truy cập trực tiếp vào AgentService. Muốn trở thành Agent phải thực hiện đăng ký thông qua `UC01`. |
| **Agent** | Quyền CRUD giới hạn: Chỉ được Đọc, Sửa hồ sơ đối tác của chính mình. Không có quyền tự phê duyệt hoặc từ chối hồ sơ. |
| **Admin** | Quyền Tối cao (Super Admin): Phê duyệt, từ chối, khóa/mở khóa hồ sơ đối tác trên toàn sàn. |

---

## 3. Danh Sách Case Sử Dụng (Use Cases)

### 3.1. Quản Lý Hồ Sơ Đối Tác (Agent Profile Management)

#### UC01 - Đăng Ký Trở Thành Đối Tác
* **Actor:** User (đã đăng nhập) hoặc Guest đăng ký mới.
* **Mô tả:** Người dùng gửi yêu cầu đăng ký hồ sơ kinh doanh (Merchant) để trở thành Agent trên hệ thống.
* **Điều kiện tiên quyết:**
  * Email chưa từng được đăng ký trên hệ thống (nếu đăng ký mới), hoặc tài khoản `User` hiện tại chưa có hồ sơ Agent nào.
* **Luồng xử lý chính:**
  1. Người dùng điền thông tin doanh nghiệp (Tên doanh nghiệp, mã số thuế, giấy phép kinh doanh...).
  2. Hệ thống validate các ràng buộc dữ liệu đầu vào bắt buộc.
  3. Hệ thống tạo bản ghi `User` với `role = AGENT` (nếu đăng ký mới) và tạo hồ sơ `AgentProfile` liên kết, mặc định trạng thái duyệt là `PENDING`.
* **Kết quả:** Hồ sơ đối tác được tạo thành công, chờ Admin xét duyệt. Agent **chưa** có quyền tạo cơ sở lưu trú ở bước này.

#### UC02 - Cập Nhật Hồ Sơ Đối Tác
* **Actor:** Agent.
* **Điều kiện tiên quyết:** Hồ sơ đối tác thuộc quyền sở hữu của chính Agent yêu cầu (khớp `userId`).
* **Nghiệp vụ:** Chỉ cho phép chỉnh sửa các trường mô tả doanh nghiệp, thông tin liên hệ, giấy phép kinh doanh. **Không** cho phép Agent tự đổi `approvalStatus` — mọi thay đổi trạng thái duyệt chỉ do Admin thực hiện (`UC04`, `UC05`).
* Nếu hồ sơ đang ở trạng thái `REJECTED`, Agent được phép cập nhật lại thông tin và hệ thống tự động chuyển trạng thái về `PENDING` để chờ Admin xét duyệt lại.

#### UC03 - Xem Chi Tiết / Danh Sách Hồ Sơ Đối Tác
* **Actor:** Agent (chỉ xem hồ sơ của chính mình) / Admin (xem toàn bộ).
* **Tính năng hỗ trợ (dành cho Admin):** Bắt buộc phân trang (`page`, `limit`), hỗ trợ lọc theo `approvalStatus` (`PENDING`, `APPROVED`, `REJECTED`).

#### UC04 - Phê Duyệt Hồ Sơ Đối Tác
* **Actor:** Admin.
* **Điều kiện tiên quyết:** Hồ sơ đối tác đang ở trạng thái `PENDING`.
* **Luồng xử lý chính:**
  1. Admin xem xét thông tin và giấy phép kinh doanh của Agent.
  2. Admin xác nhận phê duyệt.
  3. Hệ thống cập nhật `approvalStatus = APPROVED` và ghi nhận thời điểm `approvedAt`.
* **Kết quả:** Agent chính thức được phép tạo cơ sở lưu trú thông qua PropertyService.

#### UC05 - Từ Chối Hồ Sơ Đối Tác
* **Actor:** Admin.
* **Điều kiện tiên quyết:** Hồ sơ đối tác đang ở trạng thái `PENDING`.
* **Nghiệp vụ:** Hệ thống cập nhật `approvalStatus = REJECTED`, có thể kèm lý do từ chối (`rejectionReason`) để Agent biết và chỉnh sửa lại hồ sơ theo `UC02`.

#### UC06 - Khóa / Mở Khóa Hồ Sơ Đối Tác
* **Actor:** Admin.
* **Mô tả:** Áp dụng khi Agent vi phạm chính sách sau khi đã được duyệt (`APPROVED`).
* **Nghiệp vụ:** Chuyển `approvalStatus` sang `BANNED`. Khi Agent bị khóa, toàn bộ cơ sở lưu trú thuộc quyền sở hữu của Agent đó **không** tự động bị xóa, nhưng PropertyService cần kiểm tra trạng thái Agent trước khi cho phép các thao tác tạo/sửa cơ sở lưu trú mới.

### 3.2. Quản Lý Chuỗi Cơ Sở Lưu Trú (Multi-Property Ownership)

#### UC07 - Xem Danh Sách Cơ Sở Lưu Trú Thuộc Sở Hữu
* **Actor:** Agent.
* **Mô tả:** Agent xem danh sách toàn bộ cơ sở lưu trú mà mình đang sở hữu và quản lý (dữ liệu cơ sở lưu trú thực tế nằm ở PropertyService, AgentService chỉ đóng vai trò cung cấp `userId` để PropertyService lọc theo chủ sở hữu).
* **Ghi chú:** Một Agent có thể sở hữu và quản lý nhiều cơ sở lưu trú khác nhau, thuộc nhiều loại hình khác nhau (mô hình chuỗi — ví dụ vừa sở hữu Hotel, vừa sở hữu Homestay, vừa sở hữu Glamping).

#### UC08 - Thống Kê Doanh Thu Cơ Bản (Dashboard)
* **Actor:** Agent.
* **Mô tả:** Xem báo cáo doanh thu tổng hợp theo tháng/quý/năm của toàn bộ cơ sở lưu trú thuộc quyền sở hữu.
* **Ghi chú:** Dữ liệu doanh thu thực tế được tổng hợp từ BookingService/PaymentService; AgentService chỉ đóng vai trò hiển thị dashboard tổng hợp dựa trên `userId` của Agent.

---

## 4. Quy Tắc Nghiệp Vụ Hệ Thống (Business Rules)

### Quy tắc khối Hồ Sơ Đối Tác (Agent Profile Rules)
* **BR01:** Tên doanh nghiệp (`businessName`) không được phép rỗng hoặc để trống.
* **BR02:** Mã số thuế (`taxCode`), nếu có nhập, phải là duy nhất trên toàn hệ thống — không cho phép 2 Agent khác nhau dùng chung một mã số thuế.
* **BR03:** Giấy phép kinh doanh (`businessLicense`) là đường dẫn URL trả về từ MediaService sau khi Agent upload tài liệu; AgentService không tự xử lý logic upload file.
* **BR04:** Tất cả hồ sơ đối tác khi mới khởi tạo đều mang trạng thái duyệt mặc định là `PENDING` (Chờ duyệt).
* **BR05:** Chỉ hồ sơ đối tác có `approvalStatus = APPROVED` mới được phép thực hiện các hành vi tạo/sửa cơ sở lưu trú bên PropertyService (`BR04` của PropertyService).
* **BR06:** Agent chỉ có đặc quyền can thiệp dữ liệu (Read/Update) trên hồ sơ đối tác của chính mình, không được xem hoặc sửa hồ sơ của Agent khác.
* **BR07:** Chỉ tài khoản có `role = ADMIN` mới có quyền thay đổi `approvalStatus` (phê duyệt, từ chối, khóa).
* **BR08:** Khi hồ sơ bị từ chối (`REJECTED`) và Agent cập nhật lại thông tin, hệ thống bắt buộc phải reset `approvalStatus` về `PENDING`, không được giữ nguyên trạng thái `REJECTED`.
* **BR09:** Một tài khoản `User` chỉ được sở hữu **duy nhất một** hồ sơ `AgentProfile` (quan hệ 1-1), không cho phép đăng ký nhiều hồ sơ đối tác trùng lặp trên cùng một tài khoản.
* **BR10:** Hồ sơ đối tác đã bị khóa (`BANNED`) không thể tự khôi phục trạng thái; chỉ Admin mới có quyền mở khóa trở lại.

---

## 5. Danh Mục Mã Lỗi Hệ Thống (Exceptions Matrix)

| Mã Lỗi (Exception Code) | Trạng Thái HTTP (Status) | Nội Dung / Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- |
| `AGENT_NOT_FOUND` | 404 Not Found | Không tồn tại hồ sơ đối tác ứng với `userId` yêu cầu. |
| `AGENT_ALREADY_EXISTS` | 400 Bad Request | Tài khoản đã có hồ sơ đối tác, không được đăng ký thêm (vi phạm BR09). |
| `TAX_CODE_DUPLICATED` | 400 Bad Request | Mã số thuế đã tồn tại trên hệ thống (vi phạm BR02). |
| `AGENT_NOT_APPROVED` | 403 Forbidden | Hồ sơ đối tác chưa được duyệt (`PENDING`/`REJECTED`), chưa đủ điều kiện tạo cơ sở lưu trú. |
| `AGENT_BANNED` | 403 Forbidden | Hồ sơ đối tác đã bị khóa, không thể thực hiện thao tác nghiệp vụ. |
| `INVALID_APPROVAL_STATE` | 409 Conflict | Thao tác phê duyệt/từ chối không hợp lệ do hồ sơ không ở trạng thái `PENDING`. |
| `ACCESS_DENIED` | 403 Forbidden | Tài khoản không có quyền can thiệp vào hồ sơ đối tác của Agent khác. |

---

## 6. Kiến Trúc Danh Sách API Dự Kiến (API Endpoints Layout)

### 6.1. Phân Hệ Hồ Sơ Đối Tác (Agent Profile Endpoints)
* `POST   /api/v1/agents` : Đăng ký hồ sơ đối tác mới (Mặc định `PENDING`).
* `GET    /api/v1/agents` : Lấy danh sách hồ sơ đối tác (Chỉ Admin, có phân trang, lọc theo `approvalStatus`).
* `GET    /api/v1/agents/me` : Agent xem hồ sơ đối tác của chính mình.
* `GET    /api/v1/agents/{userId}` : Admin xem chi tiết hồ sơ đối tác cụ thể.
* `PUT    /api/v1/agents/me` : Agent cập nhật thông tin hồ sơ của chính mình.

### 6.2. Phân Hệ Phê Duyệt (Approval Endpoints — Admin Only)
* `PATCH  /api/v1/agents/{userId}/approve` : Phê duyệt hồ sơ đối tác.
* `PATCH  /api/v1/agents/{userId}/reject` : Từ chối hồ sơ đối tác (kèm lý do).
* `PATCH  /api/v1/agents/{userId}/ban` : Khóa hồ sơ đối tác.
* `PATCH  /api/v1/agents/{userId}/unban` : Mở khóa hồ sơ đối tác.

### 6.3. Phân Hệ Thống Kê (Dashboard Endpoints)
* `GET    /api/v1/agents/me/dashboard` : Xem thống kê doanh thu cơ bản theo tháng/quý/năm của Agent hiện tại.

---

## 7. Ghi Chú Định Hướng Thiết Kế
* Toàn bộ tham chiếu trước đây tới **HotelService** trong tài liệu này đã được đổi thành **PropertyService**, đồng bộ với việc đổi tên model `Hotel` → `Property` để phản ánh đúng bản chất đa dạng loại hình lưu trú (Hotel, Homestay, Resort, Villa, Glamping...) mà hệ thống hỗ trợ.
* Bản thân cấu trúc nghiệp vụ và các trường dữ liệu của `AgentProfile` **không thay đổi** — việc đổi tên chỉ ảnh hưởng đến các đoạn văn bản mô tả liên kết chéo giữa AgentService và PropertyService (UC01, UC04, UC06, UC07, BR05), không phát sinh thêm business rule mới.
