# ĐẶC TẢ NGHIỆP VỤ HOTELSERVICE (ACCOMMODATION MANAGEMENT)

## 1. Mục Tiêu (Purpose)
* **HotelService** chịu trách nhiệm quản lý toàn bộ vòng đời thông tin khách sạn, danh mục các loại phòng (Room Types) và danh sách các phòng vật lý cụ thể (Rooms) của từng cơ sở lưu trú.
* Dịch vụ này cô lập hoàn toàn logic quản trị tài nguyên tĩnh, **không** xử lý các nghiệp vụ liên quan đến đặt phòng (Booking), thanh toán (Payment) hay đánh giá (Review).

---

## 2. Phân Quyền Hệ Thống (Authorization Matrix)

| Vai Trò (Role) | Phạm Vi Quyền Hạn (Scope) |
| :--- | :--- |
| **Guest / User** | Quyền Đọc (Read-only): Xem danh sách, tìm kiếm, lọc và xem chi tiết khách sạn/loại phòng công khai. |
| **Agent** | Quyền CRUD giới hạn: Chỉ có quyền Thêm, Đọc, Sửa, Xóa tài nguyên (Hotel, Room Type, Room) thuộc quyền sở hữu của chính mình. |
| **Admin** | Quyền Tối cao (Super Admin): Quản lý, phê duyệt, đóng băng hoặc điều chỉnh toàn bộ dữ liệu trên toàn sàn. |

---

## 3. Danh Sách Case Sử Dụng (Use Cases)

### 3.1. Quản Lý Khách Sạn (Hotel Management)

#### UC01 - Tạo Khách Sạn Mới
* **Actor:** Agent.
* **Mô tả:** Đối tác (Chủ khách sạn) đăng ký thông tin cơ sở lưu trú mới lên hệ thống.
* **Điều kiện tiên quyết:** * Agent đã đăng nhập thành công.
  * Tài khoản có vai trò `role = 'AGENT'`.
  * Hồ sơ đối tác đã được Admin phê duyệt kích hoạt (`status = 'APPROVED'`).
* **Luồng xử lý chính:**
  1. Agent điền đầy đủ thông tin khách sạn (Tên, mô tả, mã tỉnh thành, địa chỉ chi tiết...).
  2. Hệ thống kiểm tra và validate các ràng buộc dữ liệu đầu vào.
  3. Hệ thống lưu thông tin khách sạn vào CSDL với trạng thái kiểm duyệt mặc định là `PENDING`.
* **Kết quả:** Bản ghi khách sạn được tạo thành công, chờ Admin phê duyệt để hiển thị công khai.

#### UC02 - Cập Nhật Khách Sạn
* **Actor:** Agent.
* **Điều kiện tiên quyết:** Khách sạn thuộc quyền sở hữu của Agent yêu cầu (Khớp mã `agent_id`).
* **Nghiệp vụ:** Chỉ cho phép chỉnh sửa các trường thông tin mô tả, chính sách, tiện ích. Không cho phép thay đổi quyền sở hữu `agent_id`.

#### UC03 - Xóa Khách Sạn
* **Actor:** Agent / Admin.
* **Nghiệp vụ:** Áp dụng cơ chế **Soft Delete** (Chuyển đổi trạng thái sang `INACTIVE` hoặc gán cờ `is_deleted = true`). Chặn hành vi xóa vật lý (Hard Delete) khỏi CSDL nếu khách sạn đã từng phát sinh dữ liệu Booking lịch sử.

#### UC04 - Xem Danh Sách Khách Sạn
* **Actor:** Guest / User / Agent / Admin.
* **Tính năng hỗ trợ:** Bắt buộc phân trang (`page`, `limit`), hỗ trợ sắp xếp (`sort_by`) và tìm kiếm cơ bản.

#### UC05 - Xem Chi Tiết Khách Sạn
* **Actor:** Guest / User / Agent / Admin.
* **Dữ liệu hiển thị:** Thông tin tổng quan khách sạn, danh sách các loại phòng (Room Types) tương ứng và điểm số đánh giá trung bình (`rating_average`).

---

### 3.2. Quản Lý Loại Phòng (Room Type Management)

#### UC06 - Thêm Loại Phòng
* **Actor:** Agent.
* **Mô tả:** Định nghĩa các phân hạng phòng có trong khách sạn (Ví dụ: *Deluxe, VIP, Family, Standard, Suite*).

#### UC07 - Cập Nhật Loại Phòng
* **Actor:** Agent.
* **Nghiệp vụ:** Chỉnh sửa thông tin giá cơ bản, sức chứa tối đa, diện tích hoặc mô tả tiện ích. Chặn quyền chỉnh sửa nếu phân hạng phòng thuộc khách sạn của Agent khác.

#### UC08 - Xóa Loại Phòng
* **Actor:** Agent.
* **Nghiệp vụ:** Hệ thống chỉ cho phép xóa loại phòng nếu và chỉ nếu **không còn bất kỳ phòng vật lý nào** thuộc phân hạng này đang tồn tại trong hệ thống.

---

### 3.3. Quản Lý Phòng Vật Lý (Room Management)

#### UC09 - Thêm Phòng Vật Lý
* **Actor:** Agent.
* **Mô tả:** Khai báo danh sách các mã phòng thực tế có trong khách sạn (Ví dụ: *Phòng 101, Phòng 102, Phòng 201*).

#### UC10 - Cập Nhật Phòng
* **Actor:** Agent.
* **Nghiệp vụ:** Cho phép thay đổi số tầng (`floor`), trạng thái hoạt động (`status`). Chặn hành vi chuyển đổi loại phòng (`room_type_id`) nếu phòng đó đang nằm trong một lịch trình Booking chưa hoàn thành.

#### UC11 - Xóa Phòng
* **Actor:** Agent.
* **Nghiệp vụ:** Chặn xóa hoàn toàn nếu phòng đã từng nằm trong lịch sử đặt phòng của khách hàng để đảm bảo tính toàn vẹn dữ liệu kế toán/đối soát.

#### UC12 - Truy Vấn Danh Sách Phòng
* **Actor:** Agent / Admin.
* **Bộ lọc hỗ trợ:** Xem danh sách phòng theo từng `room_type_id`, theo `hotel_id` hoặc tìm kiếm trực tiếp theo số phòng.

#### UC13 - Tìm Kiếm Khách Sạn & Phòng Nâng Cao (Search Engine)
* **Actor:** Guest / User.
* **Bộ lọc tìm kiếm:** Hỗ trợ lọc đa điều kiện theo Mã Tỉnh/Thành phố (`province_code`), khoảng giá tiền (`min_price` - `max_price`), và sức chứa tối đa (`max_occupancy`).

---

## 4. Quy Tắc Nghiệp Vụ Hệ Thống (Business Rules)

### Quy tắc khối Khách Sạn (Hotel Rules)
* **BR01:** Tên hiển thị của khách sạn không được phép rỗng hoặc để trống.
* **BR02:** Trường thông tin Mã Tỉnh/Thành phố (`province_code`) là bắt buộc để phục vụ bộ định tuyến tìm kiếm.
* **BR03:** Địa chỉ chi tiết (`address_detail`) không được để trống.
* **BR04:** Chỉ có tài khoản có quyền `role = 'AGENT'` và trạng thái kích hoạt mới được quyền tạo khách sạn.
* **BR05:** Tất cả các khách sạn khi mới khởi tạo đều mang trạng thái mặc định là `PENDING` (Chờ duyệt).
* **BR06:** Hệ thống chỉ hiển thị ra ngoài trang chủ cho Guest/User các khách sạn có trạng thái chính xác là `ACTIVE`.
* **BR07:** Agent chỉ có đặc quyền can thiệp dữ liệu (Read/Update/Delete) trên các khách sạn do chính mình sở hữu.
* **BR08:** Chặn tuyệt đối hành vi xóa khách sạn nếu tồn tại các đơn đặt phòng (Booking) liên kết.

### Quy tắc khối Loại Phòng (Room Type Rules)
* **BR09:** Giá phòng cơ bản (`base_price`) cấu hình phải là số dương lớn hơn 0 ($base\_price > 0$).
* **BR10:** Sức chứa tối đa (`max_occupancy`) phải lớn hơn hoặc bằng 1 người.
* **BR11:** Tên định danh loại phòng không được phép rỗng.

### Quy tắc khối Phòng Vật Lý (Room Rules - Thiết kế Chuẩn hóa PMS)
* **BR12 (Quy tắc thiết kế hệ thống chuyên nghiệp):** Mã số phòng (`room_number`) phải là **duy nhất trong phạm vi của một Khách sạn**, không bị bó buộc độc quyền bởi Loại phòng. Ràng buộc toàn vẹn trên CSDL sẽ là `UNIQUE(hotel_id, room_number)`.
  * *Ví dụ hợp lệ:* * Khách sạn A: Có phòng `101` (Loại Standard), phòng `102` (Loại Deluxe).
    * Khách sạn B: Có phòng `101` (Loại VIP), phòng `102` (Loại Standard).
  * *Ví dụ vi phạm:* Khách sạn A cấu hình Phòng `101` (Loại Standard) và tiếp tục tạo thêm một phòng nữa cũng số `101` (Loại Deluxe) $\rightarrow$ **Hệ thống chặn trùng lập.**
  * *Lợi ích:* Giúp phòng linh hoạt chuyển đổi phân hạng (Ví dụ: Nâng cấp phòng 101 từ Standard lên VIP) mà không làm gãy kiến trúc CSDL hoặc vi phạm các ràng buộc dữ liệu lịch sử.
* **BR13:** Trạng thái khởi tạo mặc định của một phòng vật lý mới luôn luôn là `AVAILABLE` (Sẵn sàng đón khách).

---

## 5. Danh Mục Mã Lỗi Hệ Thống (Exceptions Matrix)

| Mã Lỗi (Exception Code) | Trạng Thái HTTP (Status) | Nội Dung / Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- |
| `HOTEL_NOT_FOUND` | 404 Not Found | Không tồn tại khách sạn ứng với ID yêu cầu. |
| `ROOM_TYPE_NOT_FOUND` | 404 Not Found | Không tìm thấy phân hạng loại phòng trong hệ thống. |
| `ROOM_NOT_FOUND` | 404 Not Found | Không tìm thấy mã phòng vật lý được chỉ định. |
| `HOTEL_ALREADY_EXISTS` | 400 Bad Request | Trùng lặp thông tin đăng ký khách sạn. |
| `ROOM_NUMBER_DUPLICATED`| 400 Bad Request | Số phòng đã tồn tại trong khách sạn này (Vi phạm BR12). |
| `ROOM_HAS_BOOKING` | 409 Conflict | Chặn hành động do phòng đang dính lịch trình đặt phòng. |
| `ACCESS_DENIED` | 403 Forbidden | Tài khoản không có quyền can thiệp vào tài nguyên của Agent khác. |

---

## 6. Kiến Trúc Danh Sách API Dự Kiến (API Endpoints Layout)

### 6.1. Phân Hệ Khách Sạn (Hotel Endpoints)
* `POST   /api/v1/hotels` : Khởi tạo hồ sơ khách sạn mới (Mặc định `PENDING`).
* `GET    /api/v1/hotels` : Lấy danh sách khách sạn công khai (Phân trang, bộ lọc cho User).
* `GET    /api/v1/hotels/{id}` : Lấy thông tin chi tiết một khách sạn cụ thể kèm danh mục phòng.
* `PUT    /api/v1/hotels/{id}` : Cập nhật thông tin chi tiết khách sạn (Chỉ chủ sở hữu).
* `DELETE /api/v1/hotels/{id}` : Thực hiện Soft Delete / Chuyển đổi trạng thái ẩn khách sạn.

### 6.2. Phân Hệ Loại Phòng (Room Type Endpoints)
* `POST   /api/v1/room-types` : Khởi tạo phân hạng loại phòng cho khách sạn.
* `GET    /api/v1/hotels/{hotelId}/room-types` : Lấy toàn bộ các loại phòng đang kinh doanh của khách sạn.
* `PUT    /api/v1/room-types/{id}` : Sửa đổi biểu giá cơ bản, diện tích, sức chứa của loại phòng.
* `DELETE /api/v1/room-types/{id}` : Xóa phân hạng loại phòng (Chỉ cho phép nếu số lượng phòng vật lý bằng 0).

### 6.3. Phân Hệ Phòng Vật Lý (Room Endpoints)
* `POST   /api/v1/rooms` : Khai báo số phòng vật lý thực tế vào khách sạn.
* `GET    /api/v1/room-types/{roomTypeId}/rooms` : Xem danh sách phòng thực tế đang thuộc cấu hình loại phòng này.
* `PUT    /api/v1/rooms/{id}` : Chuyển đổi trạng thái phòng (`AVAILABLE`, `MAINTENANCE`...) hoặc đổi số tầng.
* `DELETE /api/v1/rooms/{id}` : Xóa phòng ra khỏi hệ thống (Chỉ cho phép nếu chưa từng phát sinh giao dịch).