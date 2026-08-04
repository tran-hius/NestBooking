# Hướng Dẫn Triển Khai & Chạy Dự Án NestBooking (System Guide)

Tài liệu hướng dẫn chi tiết từng bước thiết lập môi trường, cấu hình cơ sở dữ liệu, chạy nạp dữ liệu mẫu bằng query SQL (`seed.sql`), khởi chạy Backend API, Frontend Client và kiểm thử hệ thống NestBooking.

---

## 📂 1. Cấu Trúc File Query SQL Seed

File query SQL khởi tạo dữ liệu mẫu cực kỳ chi tiết cho toàn bộ 13 bảng dữ liệu đã được bổ sung tại đường dẫn:
👉 **[`api/prisma/seed.sql`](file:///c:/Users/Admin/OneDrive/Desktop/Booking/api/prisma/seed.sql)**

### 📊 Danh sách các bảng dữ liệu được nạp trong `seed.sql`:
1. **`users` & `user_profiles`**: Tạo sẵn các tài khoản demo (Admin, 2 Agent/Chủ khách sạn, 2 Customer/Khách hàng) với mật khẩu chuẩn hóa mã hóa Bcrypt `123456`.
2. **`destinations`**: Tạo sẵn danh mục các điểm đến du lịch hot tại Việt Nam (Hà Nội, Hạ Long, Đà Nẵng, Ninh Bình, Cát Bà, Phú Quốc).
3. **`hotels`**: Tạo sẵn các cơ sở lưu trú đa dạng loại hình (`HOTEL`, `RESORT`, `VILLA`, `CRUISE`) gắn với các địa danh thực tế.
4. **`hotel_images`**: Album ảnh chất lượng cao cho từng khách sạn.
5. **`room_types`**: Chi tiết các hạng phòng (Deluxe, Executive Suite, Mountain View Bungalow, Ocean Balcony Cruise Cabin, Beachfront Villa 4PN) kèm mức giá và tiện ích.
6. **`room_type_images`**: Ảnh đại diện cho từng loại phòng.
7. **`rooms`**: Tạo danh sách các phòng vật lý thực tế (Phòng 101, 102, 201, BG-01, C-101, Villa-A...).
8. **`bookings` & `booking_rooms`**: Tạo lịch sử đơn đặt phòng mẫu với các trạng thái (`CONFIRMED`, `PENDING`), phương thức thanh toán (`VNPAY`, `PAY_AT_HOTEL`).
9. **`reviews`**: Đánh giá và nhận xét mẫu từ khách hàng đã trải nghiệm dịch vụ.
10. **`notifications`**: Thông báo ứng dụng cho người dùng và chủ nhà.

---

## 🛠 2. Yêu Cầu Môi Trường (Prerequisites)

Trước khi chạy dự án, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên (`node -v`)
- **npm** hoặc **yarn**
- **Docker Desktop** (Khuyên dùng để bật PostgreSQL & Redis nhanh chóng)
- **PostgreSQL Server** (Nếu không dùng Docker, cần mở Postgres trên cổng `5432` hoặc `5433`)

---

## 🚀 3. Hướng Dẫn Chạy Dự Án Từ A Đến Z

### Bước 1: Tải dependencies cho cả Backend và Frontend

Mở 2 cửa sổ Terminal hoặc chạy các lệnh sau:

```bash
# 1. Cài đặt thư viện cho API Backend
cd api
npm install

# 2. Cài đặt thư viện cho Client Frontend
cd ../client
npm install
```

---

### Bước 2: Khởi chạy Cơ sở dữ liệu PostgreSQL & Redis qua Docker Compose

Tại thư mục gốc dự án (`Booking`), khởi chạy Docker Compose:

```bash
# Khởi chạy PostgreSQL & Redis trong background
docker-compose up -d postgres_db redis_cache
```

*(Lưu ý: PostgreSQL sẽ lắng nghe ở cổng `5433:5432` hoặc `5432` theo file cấu hình).*

---

### Bước 3: Chạy Migration và Nạp Dữ Liệu SQL Seed (`seed.sql`)

Vào thư mục `api` và thực hiện đồng bộ cấu trúc cơ sở dữ liệu & nạp dữ liệu SQL:

```bash
cd api

# 1. Đồng bộ cấu trúc bảng Prisma sang PostgreSQL
npx prisma migrate dev --name init

# 2. Chạy lệnh nạp dữ liệu SQL Seed cực kỳ chi tiết từ file prisma/seed.sql
npm run seed:sql
```

> **Cách nạp SQL Seed thủ công bằng lệnh psql (Nếu cần):**
> ```bash
> psql -U postgres -h localhost -p 5432 -d booking -f prisma/seed.sql
> ```

---

### Bước 4: Khởi chạy Backend Server API

Tại thư mục `api`:

```bash
npm run dev
```
- API Server sẽ khởi chạy tại: **`http://localhost:3000`**
- Tài liệu Swagger API sẽ có tại: **`http://localhost:3000/api-docs`**

---

### Bước 5: Khởi chạy Frontend Client Application

Mở một cửa sổ Terminal mới, chuyển vào thư mục `client`:

```bash
cd client
npm run dev
```
- Web Client sẽ khởi chạy tại: **`http://localhost:5173`**

---

## 🔑 4. Danh Sách Tài Khoản Demo Để Kiểm Thử

Tất cả các tài khoản demo dưới đây dùng chung mật khẩu: **`123456`**

| Vai trò (Role) | Email đăng nhập | Mật khẩu | Mô tả quyền hạn |
|:---|:---|:---:|:---|
| **ADMIN** | `admin@booking.com` | `123456` | Quản trị tối cao: Duyệt khách sạn mới, quản lý người dùng, quản lý điểm đến. |
| **AGENT** | `agent1@booking.com` | `123456` | Đối tác / Chủ chỗ nghỉ: Quản lý The Hanoi Club Hotel & Sapa Retreat, tạo loại phòng. |
| **AGENT** | `agent2@booking.com` | `123456` | Đối tác / Chủ chỗ nghỉ: Quản lý Hạ Long Cruise & Danang Beach Villa. |
| **CUSTOMER** | `user1@booking.com` | `123456` | Khách hàng: Đã có đơn đặt phòng xem tại trang "Chuyến đi của tôi" (`My Bookings`). |
| **CUSTOMER** | `user2@booking.com` | `123456` | Khách hàng: Đã có lịch sử đặt phòng chờ thanh toán. |

---

## 🧪 5. Kiểm Thử Các Chức Năng Nổi Bật

### 💳 1. Thanh toán Cổng VNPay Sandbox:
- Chọn một phòng bất kỳ ➔ Chuyển sang bước Checkout ➔ Chọn phương thức **Thanh toán qua VNPay**.
- Khi chuyển sang trang Cổng VNPay Sandbox, nhập thông tin thẻ test:
  - **Ngân hàng:** NCB
  - **Số thẻ:** `9704198526191432`
  - **Tên chủ thẻ:** `NGUYEN VAN A`
  - **Ngày phát hành:** `07/15`
  - **Mã OTP:** `123456`
- Sau khi bấm xác nhận, hệ thống sẽ tự động cập nhật chữ ký bảo mật IPN và chuyển về trang **Kết quả thanh toán thành công**.

### 🌐 2. Kiểm thử Đa ngôn ngữ (i18n Việt - Anh):
- Bấm vào nút chuyển đổi ngôn ngữ (`VI / EN`) trên thanh Header.
- Kiểm tra toàn bộ giao diện từ Trang chủ, Tìm kiếm, Chi tiết phòng, Checkout, My Bookings đến Hồ sơ cá nhân đều chuyển ngữ mượt mà.
