# ĐẶC TẢ NGHIỆP VỤ PROPERTYSERVICE (ACCOMMODATION MANAGEMENT)

## 1. Mục Tiêu (Purpose)
* **PropertyService** chịu trách nhiệm quản lý toàn bộ vòng đời thông tin cơ sở lưu trú (gọi là "Property" trong hệ thống, bao gồm nhiều loại hình khác nhau như Khách sạn, Homestay, Resort, Villa, Glamping...), danh mục các loại phòng (Room Types) và danh sách các phòng vật lý cụ thể (Rooms) của từng cơ sở.
* Dịch vụ này cô lập hoàn toàn logic quản trị tài nguyên tĩnh, **không** xử lý các nghiệp vụ liên quan đến đặt phòng (Booking), thanh toán (Payment) hay đánh giá (Review).
* Tên gọi "Property" được lựa chọn thay cho "Hotel" vì hệ thống hỗ trợ đa dạng loại hình lưu trú thông qua trường phân loại `propertyType`, giúp người dùng tìm kiếm và lọc đúng nhu cầu (ví dụ: tìm "Glamping" ở Tà Xùa thay vì chỉ "Hotel").

---

## 2. Phân Quyền Hệ Thống (Authorization Matrix)

| Vai Trò (Role) | Phạm Vi Quyền Hạn (Scope) |
| :--- | :--- |
| **Guest / User** | Quyền Đọc (Read-only): Xem danh sách, tìm kiếm, lọc và xem chi tiết cơ sở lưu trú/loại phòng công khai. |
| **Agent** | Quyền CRUD giới hạn: Chỉ có quyền Thêm, Đọc, Sửa, Xóa tài nguyên (Property, Room Type, Room) thuộc quyền sở hữu của chính mình, không phân biệt loại hình lưu trú. |
| **Admin** | Quyền Tối cao (Super Admin): Quản lý, phê duyệt, đóng băng hoặc điều chỉnh toàn bộ dữ liệu trên toàn sàn. |

---

## 3. Danh Sách Case Sử Dụng (Use Cases)

### 3.1. Quản Lý Cơ Sở Lưu Trú (Property Management)

#### UC01 - Tạo Cơ Sở Lưu Trú Mới
* **Actor:** Agent.
* **Mô tả:** Đối tác (Chủ cơ sở) đăng ký thông tin cơ sở lưu trú mới lên hệ thống, kèm theo lựa chọn loại hình (`propertyType`).
* **Điều kiện tiên quyết:**
  * Agent đã đăng nhập thành công.
  * Tài khoản có vai trò `role = 'AGENT'`.
  * Hồ sơ đối tác đã được Admin phê duyệt kích hoạt (`status = 'APPROVED'`).
* **Luồng xử lý chính:**
  1. Agent điền đầy đủ thông tin cơ sở lưu trú (Tên, mô tả, mã tỉnh thành, địa chỉ chi tiết...) và chọn loại hình phù hợp (`propertyType`: `HOTEL`, `HOMESTAY`, `RESORT`, `APARTMENT`, `VILLA`, `LODGE`, `GLAMPING`, `BED_AND_BREAKFAST`).
  2. Hệ thống kiểm tra và validate các ràng buộc dữ liệu đầu vào.
  3. Hệ thống lưu thông tin cơ sở vào CSDL với trạng thái kiểm duyệt mặc định là `PENDING`.
* **Kết quả:** Bản ghi cơ sở lưu trú được tạo thành công, chờ Admin phê duyệt để hiển thị công khai.

#### UC02 - Cập Nhật Cơ Sở Lưu Trú
* **Actor:** Agent.
* **Điều kiện tiên quyết:** Cơ sở thuộc quyền sở hữu của Agent yêu cầu (Khớp mã `agent_id`).
* **Nghiệp vụ:** Chỉ cho phép chỉnh sửa các trường thông tin mô tả, chính sách, tiện ích, và loại hình (`propertyType`). Không cho phép thay đổi quyền sở hữu `agent_id`.

#### UC03 - Xóa Cơ Sở Lưu Trú
* **Actor:** Agent / Admin.
* **Nghiệp vụ:** Áp dụng cơ chế **Soft Delete** (Chuyển đổi trạng thái sang `INACTIVE` hoặc gán cờ `is_deleted = true`). Chặn hành vi xóa vật lý (Hard Delete) khỏi CSDL nếu cơ sở đã từng phát sinh dữ liệu Booking lịch sử.

#### UC04 - Xem Danh Sách Cơ Sở Lưu Trú
* **Actor:** Guest / User / Agent / Admin.
* **Tính năng hỗ trợ:** Bắt buộc phân trang (`page`, `limit`), hỗ trợ sắp xếp (`sort_by`), tìm kiếm cơ bản và lọc theo `propertyType` (giống bộ lọc "Hotels", "Apartments", "Resorts"... trên các nền tảng đặt phòng thực tế).

#### UC05 - Xem Chi Tiết Cơ Sở Lưu Trú
* **Actor:** Guest / User / Agent / Admin.
* **Dữ liệu hiển thị:** Thông tin tổng quan cơ sở (bao gồm `propertyType`), danh sách các loại phòng (Room Types) tương ứng và điểm số đánh giá trung bình (`rating_average`).

---

### 3.2. Quản Lý Loại Phòng (Room Type Management)

#### UC06 - Thêm Loại Phòng
* **Actor:** Agent.
* **Mô tả:** Định nghĩa các phân hạng phòng/đơn vị lưu trú có trong cơ sở. Tên gọi phân hạng linh hoạt theo `propertyType` của cơ sở cha (Ví dụ: Hotel/Resort dùng *Deluxe, VIP, Family, Standard, Suite*; Glamping dùng *Tent Standard, Tent Premium*; Villa dùng *Villa 2 phòng ngủ, Villa hồ bơi riêng*).
* **Ghi chú:** Hệ thống không ràng buộc cứng tên phân hạng theo `propertyType` — trường `name` của Room Type vẫn là chuỗi tự do do Agent nhập, đảm bảo tính linh hoạt tối đa mà không cần thay đổi cấu trúc dữ liệu.

#### UC07 - Cập Nhật Loại Phòng
* **Actor:** Agent.
* **Nghiệp vụ:** Chỉnh sửa thông tin giá cơ bản, sức chứa tối đa, diện tích hoặc mô tả tiện ích. Chặn quyền chỉnh sửa nếu phân hạng phòng thuộc cơ sở của Agent khác.

#### UC08 - Xóa Loại Phòng
* **Actor:** Agent.
* **Nghiệp vụ:** Hệ thống chỉ cho phép xóa loại phòng nếu và chỉ nếu **không còn bất kỳ phòng vật lý nào** thuộc phân hạng này đang tồn tại trong hệ thống.

---

### 3.3. Quản Lý Phòng Vật Lý (Room Management)

#### UC09 - Thêm Phòng Vật Lý
* **Actor:** Agent.
* **Mô tả:** Khai báo danh sách các mã đơn vị thực tế có trong cơ sở (Ví dụ: *Phòng 101, Phòng 102* với Hotel; *Lều A1, Lều A2* với Glamping; *Villa 01* với Villa).

#### UC10 - Cập Nhật Phòng
* **Actor:** Agent.
* **Nghiệp vụ:** Cho phép thay đổi số tầng (`floor`, nếu áp dụng được với loại hình), trạng thái hoạt động (`status`). Chặn hành vi chuyển đổi loại phòng (`room_type_id`) nếu phòng đó đang nằm trong một lịch trình Booking chưa hoàn thành.

#### UC11 - Xóa Phòng
* **Actor:** Agent.
* **Nghiệp vụ:** Chặn xóa hoàn toàn nếu phòng đã từng nằm trong lịch sử đặt phòng của khách hàng để đảm bảo tính toàn vẹn dữ liệu kế toán/đối soát.

#### UC12 - Truy Vấn Danh Sách Phòng
* **Actor:** Agent / Admin.
* **Bộ lọc hỗ trợ:** Xem danh sách phòng theo từng `room_type_id`, theo `property_id` hoặc tìm kiếm trực tiếp theo số phòng.

#### UC13 - Tìm Kiếm Cơ Sở Lưu Trú & Phòng Nâng Cao (Search Engine)
* **Actor:** Guest / User.
* **Bộ lọc tìm kiếm:** Hỗ trợ lọc đa điều kiện theo Mã Tỉnh/Thành phố (`province_code`), loại hình lưu trú (`property_type`), khoảng giá tiền (`min_price` - `max_price`), và sức chứa tối đa (`max_occupancy`).

---

## 4. Quy Tắc Nghiệp Vụ Hệ Thống (Business Rules)

### Quy tắc khối Cơ Sở Lưu Trú (Property Rules)
* **BR01:** Tên hiển thị của cơ sở lưu trú không được phép rỗng hoặc để trống.
* **BR02:** Trường thông tin Mã Tỉnh/Thành phố (`province_code`) là bắt buộc để phục vụ bộ định tuyến tìm kiếm.
* **BR03:** Địa chỉ chi tiết (`address_detail`) không được để trống.
* **BR04:** Chỉ có tài khoản có quyền `role = 'AGENT'` và trạng thái kích hoạt mới được quyền tạo cơ sở lưu trú.
* **BR05:** Tất cả các cơ sở lưu trú khi mới khởi tạo đều mang trạng thái mặc định là `PENDING` (Chờ duyệt).
* **BR06:** Hệ thống chỉ hiển thị ra ngoài trang chủ cho Guest/User các cơ sở lưu trú có trạng thái chính xác là `ACTIVE`.
* **BR07:** Agent chỉ có đặc quyền can thiệp dữ liệu (Read/Update/Delete) trên các cơ sở lưu trú do chính mình sở hữu.
* **BR08:** Chặn tuyệt đối hành vi xóa cơ sở lưu trú nếu tồn tại các đơn đặt phòng (Booking) liên kết.
* **BR09:** Trường `propertyType` là bắt buộc khi khởi tạo, phải thuộc một trong các giá trị enum được hệ thống định nghĩa sẵn (`HOTEL`, `HOMESTAY`, `RESORT`, `APARTMENT`, `VILLA`, `LODGE`, `GLAMPING`, `BED_AND_BREAKFAST`); mặc định là `HOTEL` nếu Agent không chọn.

### Quy tắc khối Loại Phòng (Room Type Rules)
* **BR10:** Giá phòng cơ bản (`base_price`) cấu hình phải là số dương lớn hơn 0 ($base\_price > 0$).
* **BR11:** Sức chứa tối đa (`max_occupancy`) phải lớn hơn hoặc bằng 1 người.
* **BR12:** Tên định danh loại phòng không được phép rỗng.

### Quy tắc khối Phòng Vật Lý (Room Rules - Thiết kế Chuẩn hóa PMS)
* **BR13 (Quy tắc thiết kế hệ thống chuyên nghiệp):** Mã số phòng (`room_number`) phải là **duy nhất trong phạm vi của một cơ sở lưu trú**, không bị bó buộc độc quyền bởi Loại phòng. Ràng buộc toàn vẹn trên CSDL sẽ là `UNIQUE(property_id, room_number)`.
  * *Ví dụ hợp lệ:*
    * Cơ sở A: Có phòng `101` (Loại Standard), phòng `102` (Loại Deluxe).
    * Cơ sở B: Có phòng `101` (Loại VIP), phòng `102` (Loại Standard).
  * *Ví dụ vi phạm:* Cơ sở A cấu hình Phòng `101` (Loại Standard) và tiếp tục tạo thêm một phòng nữa cũng số `101` (Loại Deluxe) $\rightarrow$ **Hệ thống chặn trùng lập.**
  * *Lợi ích:* Giúp phòng linh hoạt chuyển đổi phân hạng (Ví dụ: Nâng cấp phòng 101 từ Standard lên VIP) mà không làm gãy kiến trúc CSDL hoặc vi phạm các ràng buộc dữ liệu lịch sử.
* **BR14:** Trạng thái khởi tạo mặc định của một phòng vật lý mới luôn luôn là `AVAILABLE` (Sẵn sàng đón khách).

---

## 5. Danh Mục Mã Lỗi Hệ Thống (Exceptions Matrix)

| Mã Lỗi (Exception Code) | Trạng Thái HTTP (Status) | Nội Dung / Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- |
| `PROPERTY_NOT_FOUND` | 404 Not Found | Không tồn tại cơ sở lưu trú ứng với ID yêu cầu. |
| `ROOM_TYPE_NOT_FOUND` | 404 Not Found | Không tìm thấy phân hạng loại phòng trong hệ thống. |
| `ROOM_NOT_FOUND` | 404 Not Found | Không tìm thấy mã phòng vật lý được chỉ định. |
| `PROPERTY_ALREADY_EXISTS` | 400 Bad Request | Trùng lặp thông tin đăng ký cơ sở lưu trú. |
| `INVALID_PROPERTY_TYPE` | 400 Bad Request | Giá trị `propertyType` không thuộc danh sách enum hợp lệ (vi phạm BR09). |
| `ROOM_NUMBER_DUPLICATED`| 400 Bad Request | Số phòng đã tồn tại trong cơ sở này (Vi phạm BR13). |
| `ROOM_HAS_BOOKING` | 409 Conflict | Chặn hành động do phòng đang dính lịch trình đặt phòng. |
| `ACCESS_DENIED` | 403 Forbidden | Tài khoản không có quyền can thiệp vào tài nguyên của Agent khác. |

---

## 6. Kiến Trúc Danh Sách API Dự Kiến (API Endpoints Layout)

### 6.1. Phân Hệ Cơ Sở Lưu Trú (Property Endpoints)
* `POST   /api/v1/properties` : Khởi tạo hồ sơ cơ sở lưu trú mới, kèm `propertyType` (Mặc định `PENDING`).
* `GET    /api/v1/properties` : Lấy danh sách cơ sở lưu trú công khai (Phân trang, bộ lọc theo `propertyType`, `province_code`, giá... cho User).
* `GET    /api/v1/properties/{id}` : Lấy thông tin chi tiết một cơ sở lưu trú cụ thể kèm danh mục phòng.
* `PUT    /api/v1/properties/{id}` : Cập nhật thông tin chi tiết cơ sở lưu trú (Chỉ chủ sở hữu).
* `DELETE /api/v1/properties/{id}` : Thực hiện Soft Delete / Chuyển đổi trạng thái ẩn cơ sở lưu trú.

### 6.2. Phân Hệ Loại Phòng (Room Type Endpoints)
* `POST   /api/v1/room-types` : Khởi tạo phân hạng loại phòng cho cơ sở lưu trú.
* `GET    /api/v1/properties/{propertyId}/room-types` : Lấy toàn bộ các loại phòng đang kinh doanh của cơ sở.
* `PUT    /api/v1/room-types/{id}` : Sửa đổi biểu giá cơ bản, diện tích, sức chứa của loại phòng.
* `DELETE /api/v1/room-types/{id}` : Xóa phân hạng loại phòng (Chỉ cho phép nếu số lượng phòng vật lý bằng 0).

### 6.3. Phân Hệ Phòng Vật Lý (Room Endpoints)
* `POST   /api/v1/rooms` : Khai báo số phòng vật lý thực tế vào cơ sở lưu trú.
* `GET    /api/v1/room-types/{roomTypeId}/rooms` : Xem danh sách phòng thực tế đang thuộc cấu hình loại phòng này.
* `PUT    /api/v1/rooms/{id}` : Chuyển đổi trạng thái phòng (`AVAILABLE`, `MAINTENANCE`...) hoặc đổi số tầng.
* `DELETE /api/v1/rooms/{id}` : Xóa phòng ra khỏi hệ thống (Chỉ cho phép nếu chưa từng phát sinh giao dịch).

---

## 7. Ghi Chú Định Hướng Thiết Kế
* Đổi tên từ **HotelService** sang **PropertyService**, model `Hotel` sang `Property`, để phản ánh đúng bản chất đa dạng loại hình lưu trú mà hệ thống hỗ trợ (không chỉ giới hạn ở khách sạn).
* Việc bổ sung `propertyType` chỉ là **1 trường phân loại** gắn trên model `Property`, không làm thay đổi cấu trúc `RoomType`/`Room` hiện có. Mọi loại hình lưu trú (Homestay, Villa, Glamping...) đều tái sử dụng chung khái niệm "Room Type" và "Room" — ví dụ Glamping coi mỗi "Lều" là một `Room`, Villa coi mỗi "Căn" là một `Room`.
* Cách tiếp cận này giúp hệ thống thể hiện được tính đa dạng loại hình lưu trú giống các nền tảng thực tế (Booking.com, Agoda...) mà không phát sinh thêm độ phức tạp về kiến trúc CSDL hay logic nghiệp vụ.

---

## 8. Bảng Đối Chiếu Đổi Tên (Naming Migration Reference)

| Trước (Hotel...) | Sau (Property...) |
| :--- | :--- |
| `HotelService` | `PropertyService` |
| Model `Hotel` | Model `Property` |
| Bảng `hotels` | Bảng `properties` |
| Field `hotel_id` | Field `property_id` |
| `HOTEL_NOT_FOUND` | `PROPERTY_NOT_FOUND` |
| `HOTEL_ALREADY_EXISTS` | `PROPERTY_ALREADY_EXISTS` |
| `/api/v1/hotels` | `/api/v1/properties` |
