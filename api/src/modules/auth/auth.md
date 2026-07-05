# ĐẶC TẢ NGHIỆP VỤ AUTHSERVICE (AUTHENTICATION & USER MANAGEMENT)

## 1. Mục Tiêu (Purpose)
* **AuthService** chịu trách nhiệm quản lý toàn bộ vòng đời danh tính của người dùng, xử lý các cơ chế xác thực bảo mật cao và phân quyền cho toàn bộ hệ thống.
* Dịch vụ này chịu trách nhiệm trực tiếp đối với luồng Đăng ký, Đăng nhập, quản lý mã khóa JWT (Access/Refresh Token), bảo mật tài khoản (OTP, Khóa tài khoản) và đồng bộ quản lý thông tin hồ sơ người dùng cá nhân (User Profile).

---

## 2. Phân Quyền Hệ Thống (Authorization Matrix)

| Vai Trò (Role) | Phạm Vi Quyền Hạn (Scope) |
| :--- | :--- |
| **Guest** | Khách vãng lai: Thực hiện các quyền cơ bản bao gồm Đăng ký, Đăng nhập, Xác thực OTP, Quên/Đặt lại mật khẩu. |
| **User / Agent** | Người dùng đã xác thực: Có quyền quản lý, cập nhật thông tin hồ sơ cá nhân của chính mình; thực hiện đổi mật khẩu và quản lý các phiên đăng xuất (`Logout`, `Logout-all`). |
| **Admin** | Ban quản trị: Quản lý toàn quyền đối với tất cả tài khoản trên hệ thống (Khóa/Mở khóa tài khoản, điều chỉnh vai trò). |

---

## 3. Danh Sách Case Sử Dụng (Use Cases)

### 3.1. Quản Lý Tài Khoản & Bảo Mật (Account & Authentication Management)

#### UC01 - Đăng Ký Tài Khoản Mới
* **Actor:** Guest.
* **Mô tả:** Người dùng vãng lai tiến hành khởi tạo một tài khoản mới trên hệ thống bằng email cá nhân.
* **Điều kiện tiên quyết:** Địa chỉ email chưa từng tồn tại trên hệ thống.
* **Luồng xử lý chính:**
  1. Người dùng nhập Email, Mật khẩu và Họ tên đầy đủ.
  2. Hệ thống kiểm tra dữ liệu đầu vào và kiểm tra trùng lặp email.
  3. Hệ thống mã hóa mật khẩu bằng thuật toán `BCrypt`.
  4. Tạo bản ghi tài khoản tại bảng `users` với trạng thái mặc định là `PENDING`.
  5. Tạo bản ghi trống tương ứng tại bảng `user_profiles`.
  6. Hệ thống gọi qua `EmailService` để gửi mã kích hoạt OTP về email người dùng, đồng thời lưu trữ mã OTP này vào `Redis`.
* **Kết quả:** Đăng ký tài khoản thành công, tài khoản ở chế độ chờ kích hoạt.

#### UC02 - Xác Thực Mã OTP (Kích Hoạt Tài Khoản)
* **Actor:** Guest.
* **Mô tả:** Người dùng nhập mã OTP nhận được qua Email để kích hoạt quyền hoạt động cho tài khoản.
* **Điều kiện tiên quyết:** Mã OTP phải trùng khớp và còn nằm trong thời gian hiệu lực tại Redis.
* **Luồng xử lý chính:**
  1. Người dùng nhập mã OTP từ giao diện Next.js.
  2. `AuthService` tiếp nhận và đối soát trực tiếp dữ liệu với `OtpService` (Redis).
  3. Nếu mã hợp lệ, hệ thống cập nhật trạng thái tài khoản từ `PENDING` sang `ACTIVE`.
  4. Hệ thống thực hiện xóa lập tức mã OTP này khỏi Redis để tránh tái sử dụng.
* **Kết quả:** Tài khoản được kích hoạt thành công và có thể đăng nhập.

#### UC03 - Đăng Nhập Hệ Thống
* **Actor:** User / Agent / Admin.
* **Điều kiện tiên quyết:** Tài khoản phải có trạng thái chính xác là `ACTIVE`.
* **Luồng xử lý chính:**
  1. Người dùng nhập Email và Mật khẩu.
  2. Hệ thống kiểm tra sự tồn tại của Email và xác thực tính đúng đắn của Mật khẩu.
  3. Nếu khớp, hệ thống sinh cặp mã Token: **Access Token** (Thời hạn ngắn) và **Refresh Token** (Thời hạn dài).
  4. Hệ thống thực hiện băm mã (Hash) Refresh Token và lưu thông tin phiên đăng nhập vào bảng `refresh_tokens`.
  5. Trả về cặp mã JWT cho Client (Next.js) lưu trữ.
* **Kết quả:** Đăng nhập thành công, thiết lập session hoạt động.

#### UC04 - Làm Mới Access Token (Refresh Token)
* **Actor:** User / Agent / Admin.
* **Mô tả:** Cơ chế tự động lấy Access Token mới khi Access Token cũ hết hạn mà không bắt người dùng phải đăng nhập lại.
* **Luồng xử lý chính:**
  1. Client gửi Refresh Token đang lưu trữ lên hệ thống.
  2. Hệ thống băm chuỗi nhận được để đối chiếu với trường `token_hash` trong bảng `refresh_tokens`.
  3. Kiểm tra thời hạn hết hạn (`expires_at`) và trạng thái thu hồi của token.
  4. Hệ thống hủy/thu hồi mã Refresh Token cũ đó.
  5. Sinh một cặp mã mới gồm Access Token mới và Refresh Token mới, cập nhật lại vào DB (Áp dụng cơ chế **Refresh Token Rotation**).
* **Kết quả:** Client nhận được cặp mã JWT mới để duy trì trạng thái hoạt động liên tục.

#### UC05 - Đăng Xuất (Logout)
* **Actor:** User / Agent / Admin.
* **Nghiệp vụ:** Hệ thống tiếp nhận chuỗi Refresh Token hiện tại từ Client, thực hiện hủy bỏ hoặc xóa trực tiếp bản ghi chứa Token đó trong bảng `refresh_tokens`. Phiên làm việc trên thiết bị hiện tại bị vô hiệu hóa hoàn toàn.

#### UC06 - Đăng Xuất Khỏi Tất Cả Thiết Bị (Logout All)
* **Actor:** User / Agent / Admin.
* **Nghiệp vụ:** Hệ thống thực hiện lệnh xóa toàn bộ tất cả các bản ghi có chứa `user_id` tương ứng trong bảng `refresh_tokens`. Tất cả các thiết bị đang đăng nhập bằng tài khoản này đều bị ép buộc phải đăng nhập lại từ đầu.

#### UC07 - Quên Mật Khẩu (Forgot Password)
* **Actor:** Guest.
* **Nghiệp vụ:** Người dùng nhập địa chỉ Email của mình. Hệ thống kiểm tra nếu tồn tại tài khoản thì sẽ sinh mã OTP bảo mật, lưu mã vào Redis và gửi mã thông qua `EmailService`.

#### UC08 - Đặt Lại Mật Khẩu (Reset Password)
* **Actor:** Guest.
* **Điều kiện tiên quyết:** Mã OTP xác thực quên mật khẩu gửi qua email phải hợp lệ.
* **Nghiệp vụ:** Sau khi xác thực OTP thành công, người dùng nhập mật khẩu mới. Hệ thống tiến hành mã hóa `BCrypt` mật khẩu mới, cập nhật vào bảng `users`. Đồng thời, hệ thống thực hiện **thu hồi toàn bộ Refresh Token cũ** của tài khoản này trên tất cả các thiết bị nhằm ngăn chặn rủi ro tài khoản bị chiếm đoạt.

#### UC09 - Đổi Mật Khẩu Trực Tiếp (Change Password)
* **Actor:** User / Agent / Admin.
* **Điều kiện tiên quyết:** Người dùng đã đăng nhập vào hệ thống.
* **Nghiệp vụ:** Người dùng nhập mật khẩu cũ và mật khẩu mới. Hệ thống kiểm tra mật khẩu cũ, nếu chính xác sẽ tiến hành cập nhật mật khẩu mới (đã mã hóa) và thu hồi toàn bộ các Refresh Token đang hoạt động để đảm bảo an toàn.

---

### 3.2. Quản Lý Hồ Sơ Cá Nhân (Profile Management)

#### UC10 - Xem Hồ Sơ Cá Nhân
* **Actor:** User / Agent / Admin.
* **Dữ liệu hiển thị:** Truy vấn và hiển thị thông tin chi tiết từ bảng `user_profiles` bao gồm: Họ và tên, Ảnh đại diện (Avatar), Số điện thoại, Địa chỉ và Phương thức thanh toán ưu tiên.

#### UC11 - Cập Nhật Hồ Sơ Cá Nhân
* **Actor:** User / Agent / Admin.
* **Nghiệp vụ:** Cho phép người dùng chỉnh sửa các thông tin cá nhân. Hệ thống tự động kiểm tra tính duy nhất của số điện thoại (`phone_number`) nếu có sự thay đổi để tránh trùng lặp dữ liệu.

---

## 4. Quy Tắc Nghiệp Vụ Hệ Thống (Business Rules)

* **BR01:** Địa chỉ Email đăng ký tài khoản phải là duy nhất trên toàn bộ hệ thống.
* **BR02:** Dữ liệu Email đầu vào bắt buộc phải tuân thủ đúng định dạng chuẩn (`RFC 5322`).
* **BR03:** Chuỗi mật khẩu do người dùng thiết lập phải có độ dài tối thiểu từ 8 ký tự trở lên để đảm bảo độ an toàn.
* **BR04:** Mật khẩu thô tuyệt đối không được lưu trữ trực tiếp. Bắt buộc phải được băm mã hóa thông qua thuật toán bảo mật `BCrypt` trước khi lưu vào CSDL.
* **BR05:** Tất cả các tài khoản khi mới đăng ký qua luồng thông thường đều mang trạng thái mặc định ban đầu là `PENDING`.
* **BR06:** Hệ thống chỉ chấp nhận quyền đăng nhập hệ thống đối với những tài khoản đang có trạng thái chính xác là `ACTIVE`.
* **BR07 (Cơ chế chống Brute-force):** Nếu một tài khoản thực hiện đăng nhập sai mật khẩu liên tiếp quá 5 lần (`login_attempts >= 5`), hệ thống sẽ kích hoạt trạng thái khóa tài khoản tạm thời bằng cách gán mốc thời gian vào trường `lock_until`.
* **BR08:** Để bảo mật dữ liệu tuyệt đối, chuỗi Refresh Token lưu tại CSDL bắt buộc phải ở dạng băm mã hóa (`token_hash`), không lưu chuỗi ký tự thô.
* **BR09 (Refresh Token Rotation):** Mỗi khi hệ thống tiếp nhận request cấp lại Access Token, mã Refresh Token cũ gửi lên phải bị thu hồi ngay lập tức, hệ thống sinh ra một cặp mã mới thay thế. Nếu phát hiện một Refresh Token cũ (đã bị thu hồi) được gửi lại, hệ thống lập tức hủy toàn bộ các Token thuộc phiên đăng nhập đó vì có dấu hiệu bị Hacker tấn công.
* **BR10:** Mọi hành vi làm thay đổi mật khẩu (Đặt lại hoặc Đổi trực tiếp) đều kích hoạt lệnh Clear (Xóa sạch) toàn bộ danh sách Refresh Token hiện có của tài khoản đó để bảo vệ an toàn trên mọi thiết bị.
* **BR11:** Mỗi mã OTP khởi tạo chỉ có giá trị xác thực duy nhất một lần (One-Time Password).
* **BR12:** Thời gian sống (TTL) của một mã OTP lưu trữ trên Redis giới hạn tối đa là 5 phút. Quá thời gian này mã tự động biến mất và vô hiệu hiệu lực.
* **BR13:** Người dùng chỉ có đặc quyền chỉnh sửa thông tin hồ sơ (`user_profiles`) thuộc quyền sở hữu của chính mình.

---

## 5. Danh Mục Mã Lỗi Hệ Thống (Exceptions Matrix)

| Mã Lỗi (Exception Code) | Trạng Thái HTTP (Status) | Nội Dung / Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- |
| `EMAIL_ALREADY_EXISTS` | 400 Bad Request | Địa chỉ email đăng ký đã tồn tại trên sàn hệ thống. |
| `INVALID_EMAIL` | 400 Bad Request | Định dạng email đầu vào không hợp lệ. |
| `INVALID_PASSWORD` | 401 Unauthorized | Sai mật khẩu đăng nhập. |
| `ACCOUNT_PENDING` | 403 Forbidden | Tài khoản chưa được kích hoạt qua mã OTP. |
| `ACCOUNT_LOCKED` | 403 Forbidden | Tài khoản đang bị khóa tạm thời do nhập sai quá 5 lần. |
| `ACCOUNT_BANNED` | 403 Forbidden | Tài khoản đã bị đóng băng vĩnh viễn bởi Ban quản trị Admin. |
| `INVALID_OTP` | 400 Bad Request | Mã số OTP nhập vào không trùng khớp với hệ thống. |
| `OTP_EXPIRED` | 400 Bad Request | Mã OTP đã quá hạn thời gian hiệu lực 5 phút. |
| `INVALID_REFRESH_TOKEN`| 401 Unauthorized | Mã Refresh Token không tồn tại hoặc chữ ký mã không hợp lệ. |
| `REFRESH_TOKEN_EXPIRED`| 401 Unauthorized | Phiên làm việc của Refresh Token đã hết hạn, yêu cầu đăng nhập lại. |
| `ACCESS_DENIED` | 403 Forbidden | Không có quyền can thiệp vào hồ sơ của người dùng khác. |

---

## 6. Kiến Trúc Danh Sách API Dự Kiến (API Endpoints Layout)

### 6.1. Phân Hệ Xác Thực (Authentication Endpoints)
* `POST /api/v1/auth/register` : Đăng ký tài khoản mới (Mặc định `PENDING`).
* `POST /api/v1/auth/verify-otp` : Gửi mã OTP xác thực kích hoạt tài khoản sang `ACTIVE`.
* `POST /api/v1/auth/login` : Đăng nhập tài khoản, trả về cặp mã JWT (Access/Refresh Token).
* `POST /api/v1/auth/refresh-token` : Sử dụng Refresh Token để gia hạn cấp Access Token mới.
* `POST /api/v1/auth/logout` : Đăng xuất, hủy bỏ hiệu lực phiên làm việc hiện tại.
* `POST /api/v1/auth/logout-all` : Đăng xuất toàn bộ các thiết bị đang chạy.
* `POST /api/v1/auth/forgot-password`: Nhập email để yêu cầu cấp OTP đặt lại mật khẩu.
* `POST /api/v1/auth/reset-password` : Xác thực OTP và thiết lập cấu hình mật khẩu mới.
* `POST /api/v1/auth/change-password`: Đổi mật khẩu trực tiếp (Yêu cầu Token đăng nhập).

### 6.2. Phân Hệ Hồ Sơ Người Dùng (User Profile Endpoints)
* `GET /api/v1/profile/me` : Lấy thông tin chi tiết hồ sơ cá nhân của chính mình đang đăng nhập.
* `PUT /api/v1/profile` : Thay đổi/Cập nhật các trường dữ liệu cá nhân trong hồ sơ.
* `GET /api/v1/profile/{id}` : Admin sử dụng để truy vấn thông tin hồ sơ của một User bất kỳ.