# Tài liệu website Booking.com

## 1. Giới thiệu tổng quan
- Ứng dụng là một nền tảng đặt phòng khách sạn trực tuyến đa địa điểm tại Việt Nam (tập trung vào các thành phố du lịch lớn như Hà Nội, Hạ Long, Đà Nẵng...), tích hợp trí tuệ nhân tạo (AI) để tối ưu hóa trải nghiệm người dùng.

- Hệ thống kết nối trực tiếp giữa Khách hàng (tìm kiếm, kiểm tra phòng trống theo thời gian thực, đặt phòng) và Chủ khách sạn (quản lý phòng, cập nhật trạng thái và doanh thu). Trong đó, công nghệ AI được tích hợp đóng vai trò:
    - Gợi ý thông minh (AI Recommendation): Phân tích hành vi, vị trí và sở thích của khách hàng để đề xuất khách sạn/phòng phù hợp nhất tại điểm đến.
    - Trợ lý ảo (AI Chatbot): Hỗ trợ giải đáp nhanh về dịch vụ, chính sách phòng và tư vấn lịch trình du lịch tự động 24/7.
## 2. Công nghệ sử dụng
    - Frontend: Nextjs
    - Backend: Nodejs Typescript, Layered Architecture 
    - Database: PostgreSQL
    - Realtime Chat: WebSocket
    - Storage: Object Storage/S3-compatible/Cloudinary
    - Cache: Redis
    - Deploy: Docker

## 3. Kiến Trúc Hệ Thống & Luồng Dữ Liệu (Architecture & Data Flow)
3.1. Sơ đồ luồng chạy tổng quan
```text
    [Khách hàng / Đối tác] (Trình duyệt Web)
         │
         │ (HTTP/HTTPS Requests & Response)
         ▼
 ┌──────────────────────────────────────────────┐
 │             FRONTEND (Next.js)               │ <─── (Nhận Push Notification) ───┐
 └──────────────────────────────────────────────┘                                  │
         │                                                                         │
         │ (RESTful API / JSON)                                                    │
         ▼                                                                         │
 ┌──────────────────────────────────────────────┐                                  │
 │        BACKEND API (Node.js + TS)            │                                  │
 └──────────────────────────────────────────────┘                                  │
         │               │              │                                          │
         │ (Đọc/Ghi SQL) │ (Cache/Lock) │ (Upload)                                 │
         ▼               ▼              ▼                                          │
 ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                │
 │  DATABASE    │ │ IN-MEMORY    │ │ CLOUD        │                                │
 │ (PostgreSQL) │ │ (Redis)      │ │ STORAGE      │                                │
 │              │ │              │ │ (Cloudinary) │                                │
 └──────────────┘ └──────────────┘ └──────────────┘                                │
         │                                                                         │
         └─────────────────── (Trigger Sự Kiện) ──────────────────> ┌─────────────┐ │
                                                                   │ GOOGLE FCM  │─┘
                                                                   └─────────────┘
```
4.1. Bảng phân tách nhiệm vụ các Service

| STT | Tên Service | Công Nghệ Tương Tác | Nhiệm Vụ / Chức Năng Chính (Bản Cập Nhật Thương Mại) |
| :--- | :--- | :--- | :--- |
| 1 | **AuthService** | PostgreSQL, JWT, Redis | - Xử lý Đăng ký, Đăng nhập, Đăng xuất cho 3 đối tượng (User, Agent, Admin).<br>- Cấp phát và thu hồi Access Token / Refresh Token; áp dụng **Refresh Token Rotation** để chống chiếm đoạt session.<br>- Phân quyền người dùng dựa trên vai trò (Role-based Access Control - RBAC).<br>- Quản lý và hủy các Session hoạt động; hỗ trợ **Đăng xuất khỏi tất cả các thiết bị**.<br>- Xử lý Quên/Đặt lại mật khẩu (Reset Password) qua OTP và Đổi mật khẩu trực tiếp khi đã đăng nhập.<br>- Cơ chế bảo mật nâng cao: **Tự động khóa tài khoản tạm thời** sau 5 lần đăng nhập sai liên tiếp. |
| 2 | **UserService** | PostgreSQL | - Quản lý thông tin cá nhân mở rộng (Hồ sơ, địa chỉ, số điện thoại, phương thức thanh toán mặc định).<br>- Quản lý danh sách khách sạn yêu thích (Wishlist) và danh sách khách sạn đã xem gần đây (Lưu tạm vào Redis/PostgreSQL).<br>- Đồng bộ hoặc truy vấn **Lịch sử đặt phòng (Booking History)** và xem **Chi tiết đơn đặt (Booking Detail)** thông qua liên kết dữ liệu với BookingService. |
| 3 | **AgentService** | PostgreSQL | - Quản lý hồ sơ đối tác / chủ khách sạn (Merchant).<br>- Quản lý phân quyền mô hình: Một Agent có thể sở hữu và **quản lý chuỗi nhiều khách sạn** khác nhau.<br>- Luồng đăng ký gian hàng nâng cao: Upload và lưu trữ giấy phép kinh doanh, xử lý trạng thái duyệt tài khoản theo các mức (**Pending / Approved / Rejected**).<br>- Tích hợp trang Dashboard thống kê doanh thu cơ bản theo tháng/quý/năm của các cơ sở lưu trú. |
| 4 | **AdminService** | PostgreSQL | - **Dịch vụ quản trị tối cao của hệ thống:** Cung cấp bộ công cụ quản lý toàn diện cho Ban quản trị (Admin/Mod).<br>- Phê duyệt/Từ chối hồ sơ đăng ký kinh doanh của Agent và các khách sạn mới lên sàn.<br>- Quản lý trạng thái người dùng: **Khóa/Mở khóa tài khoản** (Ban User/Agent) nếu vi phạm chính sách.<br>- Xử lý điều chỉnh, quản lý danh mục hệ thống (Thêm/Sửa/Xóa danh mục tiện ích, danh sách tỉnh thành/địa điểm du lịch).<br>- Xem báo cáo tổng quan toàn sàn: Tổng doanh thu, tổng số booking, biểu đồ tăng trưởng người dùng.<br>- Tiếp nhận và xử lý các khiếu nại, tranh chấp giữa Khách hàng và Chủ khách sạn. |
| 5 | **OtpService** | Redis | - Tạo và xác thực mã OTP (6 số) bảo mật cao.<br>- Ứng dụng Redis TTL: Tự động hủy mã OTP sau 3 - 5 phút.<br>- Cơ chế chống phá hoại: **Giới hạn số lần gửi OTP** trong ngày (Rate Limiting), **chống spam resend OTP** (bắt đợi 60s giữa mỗi lần gửi), và **giới hạn tối đa 3 lần nhập sai OTP** (nếu sai quá sẽ hủy mã lập tức). |
| 6 | **MediaService** | Node.js, Cloudinary / S3 | - **Dịch vụ chuyên trách quản lý tài nguyên tĩnh:** Tập trung toàn bộ logic upload file, ảnh, video từ tất cả các service khác đổ về (ảnh khách sạn, ảnh phòng, ảnh review, avatar).<br>- Tiếp nhận file từ client, thực hiện validate (Kiểm tra định dạng ảnh `.jpg`, `.png`, `.webp`, giới hạn dung lượng < 5MB).<br>- Gọi API sang Cloudinary/S3 để lưu trữ; tự động nén dung lượng, resize kích thước tối ưu cho Web/Mobile, chuyển đổi định dạng ảnh thông minh và trả về URL tuyệt đối cho Backend lưu vào CSDL. |
| 7 | **PromotionService** | PostgreSQL, Redis | - **Dịch vụ quản lý chiến dịch giảm giá:**<br>- **Promotion:** Quản lý các chương trình ưu đãi giảm giá trực tiếp vào phòng theo mùa, ngày lễ (ví dụ: Giảm 10% phòng tại Hạ Long dịp hè).<br>- **Coupon:** Quản lý mã giảm giá do hệ thống hoặc Agent tự tạo (ví dụ: `NHAPHOI2026`, giảm tiền mặt hoặc % theo hóa đơn, có giới hạn lượt dùng và ngày hết hạn).<br>- Tự động kiểm tra tính hợp lệ của mã (hạn dùng, số lượng còn lại) trước khi áp dụng vào đơn đặt phòng. |
| 8 | **EmailService** | NodeMailer / SendGrid | - Quản lý và render hệ thống **Email Templates HTML** chuyên nghiệp (giao diện thương hiệu).<br>- Gửi email kích hoạt tài khoản/OTP, email thông báo đổi mật khẩu thành công.<br>- Gửi **Hóa đơn điện tử (Invoice / E-voucher)** kèm mã QR-code check-in ngay khi đơn đặt chuyển sang trạng thái Confirmed.<br>- Gửi email tự động khi hủy booking/hoàn tiền và email tự động nhắc nhở khách hàng trước ngày nhận phòng (1 ngày). |
| 9 | **HotelService** | PostgreSQL, Redis | - Quản lý thông tin chi tiết Khách sạn (Tên, tọa độ bản đồ, danh mục tiện ích, chính sách khách sạn, quy định giờ check-in/check-out cụ thể).<br>- Quản lý danh mục Phòng (Phân loại Deluxe, Standard..., số lượng giường, giá tiền gốc, giá khuyến mãi lấy từ PromotionService, diện tích).<br>- Quản lý album ảnh của khách sạn và từng loại phòng (Sử dụng URL trả về từ MediaService). |
| 10 | **SearchService** | PostgreSQL, Redis / Elasticsearch | - **Dịch vụ chuyên trách tối ưu hóa tìm kiếm:** Tách biệt hoàn toàn logic tìm kiếm ra khỏi HotelService để tăng tốc độ truy vấn.<br>- Xử lý các bộ lọc tìm kiếm phức tạp: Tìm theo địa điểm (Hà Nội, Hạ Long, Đà Nẵng...), khoảng giá, số lượng khách, số sao, tiện ích đi kèm (bể bơi, buffet...), và sắp xếp (giá tăng/giảm, đánh giá cao nhất).<br>- **Tối ưu hiệu năng:** Cache toàn bộ kết quả tìm kiếm các địa điểm hot hoặc các từ khóa phổ biến lên Redis để trả về kết quả tức thì (< 50ms). |
| 11 | **BookingService** | PostgreSQL, Redis | - Tiếp nhận yêu cầu đặt phòng, áp dụng mã giảm giá (`Coupon/Promotion`) từ PromotionService để tính toán số tiền cuối cùng.<br>- Kiểm tra trạng thái phòng trống theo thời gian thực (Availability Check) và dùng **Redis Distributed Lock** giữ chỗ tạm thời (10 phút).<br>- **Quản lý nghiêm ngặt Vòng đời/Trạng thái của Booking:**<br>  1. `Pending`: Đang chờ người dùng thực hiện thanh toán.<br>  2. `Confirmed`: Đã thanh toán thành công, hệ thống xác nhận giữ phòng.<br>  3. `CheckedIn`: Khách đã đến nhận phòng tại khách sạn.<br>  4. `CheckedOut`: Khách đã trả phòng và rời đi.<br>  5. `Cancelled`: Đơn bị hủy (bởi khách hoặc hệ thống).<br>  6. `Refunded`: Đã hoàn tiền thành công cho đơn đặt bị hủy hợp lệ.<br>  7. `Expired`: Quá 10 phút giữ chỗ mà khách không thanh toán, hệ thống tự động hủy đơn và giải phóng phòng.<br>- Cung cấp API phục vụ cho **Booking History (Lịch sử đặt)** và **Booking Detail (Chi tiết đặt phòng)**. |
| 12 | **PaymentService** | PostgreSQL, VNPay / Stripe Sandbox | - Tích hợp các cổng thanh toán trực tuyến an toàn, tạo link thanh toán (Secure Redirect URL).<br>- **Cơ chế chống thanh toán trùng lặp:** Áp dụng **Idempotency Key** khi gửi request thanh toán, đảm bảo một đơn hàng không bao giờ bị trừ tiền 2 lần do mạng lag hoặc user bấm nút double-click.<br>- Quản lý thông tin tài chính: Tạo **Hóa đơn (Invoice)**, lưu lịch sử giao dịch chi tiết (**Payment History**) để đối soát.<br>- **Xử lý Webhook nâng cao:** Cơ chế **Webhook Verify** (Xác thực chữ ký số bảo mật từ cổng thanh toán gửi về); tự động chạy **Payment Retry** để gọi lại API cập nhật trạng thái đơn hàng nếu hệ thống bị gián đoạn mạng.<br>- Xử lý quy trình hoàn tiền (**Refund**) tự động khi BookingService báo trạng thái `Cancelled` hợp lệ.<br>- Xử lý **Timeout thanh toán**: Gọi sang BookingService chuyển trạng thái đơn sang `Expired` nếu quá hạn. |
| 13 | **ChatService** | PostgreSQL, AI API (OpenAI / Gemini) | - **Tách biệt 2 luồng xử lý:** Luồng **AI Chatbot** (tự động tư vấn phòng, giải đáp chính sách và gợi ý lịch trình du lịch dựa trên dữ liệu hệ thống) và luồng **Live Chat** (kết nối real-time giữa Khách hàng và Chủ khách sạn thông qua Socket).<br>- Lưu trữ lịch sử hội thoại vào CSDL; hỗ trợ gửi tin nhắn dạng văn bản và truyền file hình ảnh (qua MediaService). |
| 14 | **NotificationService** | Firebase (FCM), PostgreSQL | - Đóng vai trò bộ định tuyến thông báo, hỗ trợ đa kênh: **Push Notification (FCM), In-app Notification (Thông báo trong app), và Email Notification**.<br>- Quản lý danh sách thiết bị người dùng (FCM Tokens) và lưu lịch sử thông báo vào DB.<br>- Cung cấp tính năng đánh dấu đã đọc (`Mark as Read` / `Mark all as Read`) cho người dùng. |
| 15 | **ReviewService** | PostgreSQL | - **Hệ thống đánh giá toàn diện:** Chỉ cho phép khách hàng chấm điểm (1–5 sao) và viết bình luận (Comment) sau khi Booking có trạng thái `CheckedOut`.<br>- **Ràng buộc nghiệp vụ chống spam:** Mỗi Booking chỉ được tạo một Review duy nhất (`One Booking = One Review`) nhằm đảm bảo tính chính xác.<br>- **Hỗ trợ đa phương tiện:** Cho phép đính kèm hình ảnh thực tế (Image) thông qua MediaService.<br>- **Tính năng tương tác:** Cho phép người dùng khác bấm Like vào Review; hỗ trợ Chủ khách sạn viết phản hồi chính thức (Owner Reply) để cảm ơn hoặc giải thích với khách.<br>- **Tính năng quản lý & bảo mật:** Cho phép người dùng gửi báo cáo (Report Review) vi phạm để Admin xử lý.<br>- **Giới hạn quyền chỉnh sửa:** Hỗ trợ khách hàng Edit Review hoặc Delete Review của chính mình trong vòng 7 ngày kể từ thời điểm tạo Review; quá thời hạn này hệ thống sẽ khóa và chỉ cho phép xem. |