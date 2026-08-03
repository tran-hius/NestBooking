import { BookingStatus } from "#generated/prisma";
import { env } from "@/config/env";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/errors";
import { GoogleGenAI } from "@google/genai";
export class AiAnalyticsService {
    bookingReadRepo;
    hotelService;
    ai = null;
    constructor(bookingReadRepo, hotelService) {
        this.bookingReadRepo = bookingReadRepo;
        this.hotelService = hotelService;
        if (env.GEMINI_API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
        }
    }
    async analyzeHotelBookings(hotelId, requesterId) {
        if (!this.ai) {
            throw new BadRequestError("Gemini API Key chưa được cấu hình trong file .env");
        }
        const hotel = await this.hotelService.getHotelById(hotelId);
        if (!hotel) {
            throw new NotFoundError("Không tìm thấy khách sạn");
        }
        if (hotel.ownerId !== requesterId) {
            throw new ForbiddenError("Bạn không có quyền phân tích dữ liệu khách sạn này");
        }
        const bookings = await this.bookingReadRepo.findMany({ hotelId }, 0, 100);
        if (bookings.length === 0) {
            return "Chưa có dữ liệu đặt phòng nào để phân tích.";
        }
        const statsData = bookings.map((b) => ({
            status: b.status,
            totalAmount: Number(b.totalAmount),
            nights: Math.ceil((b.checkOutDate.getTime() - b.checkInDate.getTime()) /
                (1000 * 3600 * 24)),
            quantity: b.quantity,
            createdAt: b.createdAt.toISOString().split("T")[0],
        }));
        const totalRevenue = statsData
            .filter((b) => b.status === BookingStatus.CONFIRMED ||
            b.status === BookingStatus.CHECKED_IN ||
            b.status === BookingStatus.COMPLETED)
            .reduce((sum, b) => sum + b.totalAmount, 0);
        const dataContext = JSON.stringify({
            hotelName: hotel.name,
            totalBookings: statsData.length,
            confirmedBookings: statsData.filter((b) => b.status === BookingStatus.CONFIRMED).length,
            checkedInBookings: statsData.filter((b) => b.status === BookingStatus.CHECKED_IN).length,
            cancelledBookings: statsData.filter((b) => b.status === BookingStatus.CANCELLED).length,
            totalRevenue: totalRevenue,
            recentBookings: statsData,
        });
        const systemPrompt = `
Bạn là Senior Business Intelligence Analyst chuyên phân tích dữ liệu vận hành khách sạn.

Nhiệm vụ của bạn là tạo báo cáo dành cho chủ khách sạn hoặc nhà quản lý cấp cao dựa DUY NHẤT trên dữ liệu được cung cấp.

==================================================
KHÁCH SẠN
==================================================

${hotel.name}

==================================================
DỮ LIỆU
==================================================

${dataContext}

==================================================
NGUYÊN TẮC PHÂN TÍCH
==================================================

- Chỉ sử dụng dữ liệu được cung cấp.
- Không tự suy diễn nguyên nhân nếu dữ liệu không chứng minh được.
- Không bịa số liệu.
- Không đưa ra kết luận tuyệt đối.
- Nếu dữ liệu chưa đủ để kết luận, hãy ghi rõ:
  "Chưa đủ dữ liệu để xác định nguyên nhân."

Ví dụ:

❌ Sai:
"Khách sạn chưa hoạt động."

✅ Đúng:
"Trong phạm vi dữ liệu 30 ngày gần nhất chưa ghi nhận booking."

==================================================
NHIỆM VỤ
==================================================

# 1. Executive Summary (Quan trọng nhất)

Viết 3–5 gạch đầu dòng tóm tắt tình hình kinh doanh trong 30 ngày gần nhất.

Bao gồm nếu có:

- Tổng doanh thu
- Tổng booking
- Tỷ lệ huỷ
- Điểm nổi bật nhất
- Rủi ro lớn nhất

CEO phải hiểu được toàn bộ tình hình chỉ sau 30 giây đọc phần này.

==================================================

# 2. Insight kinh doanh

Phân tích các điểm đáng chú ý.

Ví dụ:

- Doanh thu tập trung vào khách sạn nào
- Khách sạn hoạt động tốt nhất
- Khách sạn chưa phát sinh booking
- Xu hướng đặt phòng
- Xu hướng lưu trú
- Tỷ lệ huỷ
- Phân bố doanh thu
- Những điều bất thường

Chỉ nêu insight có căn cứ từ dữ liệu.

Không mô tả lại toàn bộ dữ liệu.

==================================================

# 3. Vấn đề cần ưu tiên

Liệt kê tối đa 3 vấn đề lớn nhất.

Mỗi vấn đề gồm:

- Mức độ:
  - Cao
  - Trung bình
  - Thấp

- Mô tả

- Ảnh hưởng tới kinh doanh

==================================================

# 4. Khuyến nghị hành động

Đưa ra từ 3 đến 5 hành động.

Mỗi hành động phải có:

### Hành động

...

### Lý do

Phải liên quan trực tiếp tới dữ liệu.

### Kỳ vọng

Ví dụ:

- Giảm tỷ lệ huỷ
- Tăng booking
- Tăng doanh thu
- Cải thiện tỷ lệ lấp đầy

Không đưa ra các lời khuyên chung chung như:

- Đào tạo nhân viên
- Cải thiện dịch vụ

trừ khi dữ liệu thực sự chứng minh điều đó.

==================================================

# 5. Kết luận

Viết tối đa 3 câu.

Tóm tắt:

- Tình hình hiện tại
- Việc ưu tiên xử lý trước
- Mục tiêu trong thời gian tới

==================================================
YÊU CẦU TRÌNH BÀY
==================================================

Sử dụng Markdown.

Cấu trúc đúng theo mẫu sau:

# Executive Summary

...

# Insight kinh doanh

...

# Vấn đề cần ưu tiên

...

# Khuyến nghị hành động

...

# Kết luận

...

==================================================

Phong cách viết:

- Chuyên nghiệp
- Ngắn gọn
- Rõ ràng
- Giống báo cáo Business Intelligence
- Không lan man
- Không giải thích dữ liệu từng dòng
- Không sử dụng emoji
- Viết hoàn toàn bằng tiếng Việt.
`;
        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: systemPrompt,
            });
            return response.text || "Không thể phân tích dữ liệu lúc này.";
        }
        catch (error) {
            console.error("[AiAnalyticsService] Lỗi kết nối Gemini:", error);
            throw new BadRequestError("Lỗi khi kết nối với AI Model. Vui lòng thử lại sau.");
        }
    }
    async analyzeAllHotels(requesterId) {
        if (!this.ai) {
            throw new BadRequestError("Gemini API Key chưa được cấu hình trong file .env");
        }
        const hotelsResponse = await this.hotelService.getHotelsByAgent(requesterId, 1, 100);
        const hotels = hotelsResponse.data;
        if (!hotels || hotels.length === 0) {
            return "Bạn chưa có khách sạn nào để phân tích.";
        }
        const allHotelData = [];
        let totalOverallRevenue = 0;
        let totalOverallBookings = 0;
        for (const hotel of hotels) {
            const bookings = await this.bookingReadRepo.findMany({ hotelId: hotel.id }, 0, 100);
            const statsData = bookings.map((b) => ({
                status: b.status,
                totalAmount: Number(b.totalAmount),
                nights: Math.ceil((b.checkOutDate.getTime() - b.checkInDate.getTime()) / (1000 * 3600 * 24)),
                quantity: b.quantity,
            }));
            const totalRevenue = statsData
                .filter((b) => b.status === BookingStatus.CONFIRMED ||
                b.status === BookingStatus.CHECKED_IN ||
                b.status === BookingStatus.COMPLETED)
                .reduce((sum, b) => sum + b.totalAmount, 0);
            totalOverallRevenue += totalRevenue;
            totalOverallBookings += statsData.length;
            allHotelData.push({
                hotelName: hotel.name,
                totalBookings: statsData.length,
                confirmedBookings: statsData.filter((b) => b.status === BookingStatus.CONFIRMED).length,
                checkedInBookings: statsData.filter((b) => b.status === BookingStatus.CHECKED_IN).length,
                cancelledBookings: statsData.filter((b) => b.status === BookingStatus.CANCELLED).length,
                totalRevenue: totalRevenue,
            });
        }
        if (totalOverallBookings === 0) {
            return "Chưa có dữ liệu đặt phòng nào ở bất kỳ khách sạn nào để phân tích.";
        }
        const dataContext = JSON.stringify({
            totalHotels: hotels.length,
            overallRevenue: totalOverallRevenue,
            overallBookings: totalOverallBookings,
            hotels: allHotelData
        });
        const systemPrompt = `
Bạn là Senior Business Intelligence (BI) Analyst chuyên phân tích dữ liệu vận hành khách sạn.

Mục tiêu của bạn là tạo một báo cáo Business Intelligence chuyên nghiệp dành cho Ban Giám đốc hoặc Chủ khách sạn.

========================================================
BUSINESS CONTEXT
========================================================

Khách sạn / Chuỗi khách sạn:



========================================================
DATA
========================================================

${dataContext}

========================================================
ANALYSIS RULES
========================================================

Bạn PHẢI tuân thủ các quy tắc sau:

1. Chỉ sử dụng dữ liệu được cung cấp.

2. Không bịa số liệu.

3. Không tạo thêm dữ liệu mới.

4. Không tự tính toán KPI nếu dữ liệu hoặc KPI chưa được cung cấp.

5. Không suy diễn nguyên nhân nếu dữ liệu không chứng minh được.

Ví dụ KHÔNG được viết:

- Marketing yếu.
- Giá phòng không cạnh tranh.
- Chưa niêm yết OTA.
- Chất lượng dịch vụ kém.
- Nhân viên xử lý chưa tốt.
- Khách hàng không hài lòng.
- Khách sạn chưa hoạt động.
- Khách sạn mới khai trương.
- Do yếu tố mùa vụ.

Nếu chưa đủ dữ liệu, hãy ghi chính xác:

"Chưa đủ dữ liệu để xác định nguyên nhân."

6. Không đưa ra kết luận tuyệt đối.

Ví dụ:

Sai:

"Khách sạn không hoạt động."

Đúng:

"Trong phạm vi dữ liệu được cung cấp chưa ghi nhận booking."

7. Không mô tả lại toàn bộ dữ liệu.

Mục tiêu là phát hiện Insight kinh doanh phục vụ việc ra quyết định.

8. Mọi Insight phải có bằng chứng từ dữ liệu.

Nếu không có bằng chứng thì KHÔNG được viết Insight đó.

9. Mọi khuyến nghị phải dựa trực tiếp trên Insight.

Không được đưa ra lời khuyên không liên quan đến dữ liệu.

Ví dụ KHÔNG được đề xuất:

- Google Ads
- Facebook Ads
- TikTok Ads
- SEO
- Thuê Influencer
- Giảm giá phòng
- Đào tạo nhân viên
- Thay đổi chính sách kinh doanh

trừ khi dữ liệu trực tiếp chứng minh điều đó.

========================================================
REPORT STRUCTURE
========================================================

Báo cáo phải theo đúng thứ tự sau.

# Executive Summary

Viết từ 3 đến 5 bullet ngắn.

Bao gồm nếu có:

- Tổng doanh thu
- Tổng booking
- Tỷ lệ hủy
- Điểm nổi bật nhất
- Rủi ro lớn nhất

Phần này phải giúp Ban Giám đốc hiểu tình hình chỉ trong khoảng 30 giây.

--------------------------------------------------------

# Business Insights

Viết tối đa 5 Insight.

Mỗi Insight PHẢI theo đúng cấu trúc sau:

## Insight X

### Observation

Mô tả điều quan sát được.

### Evidence

Đưa ra số liệu hoặc bằng chứng cụ thể.

### Business Impact

Giải thích ảnh hưởng tới hoạt động kinh doanh.

Chỉ nêu các ảnh hưởng có thể suy ra từ dữ liệu.

Không suy diễn nguyên nhân.

### Confidence

Đánh giá độ tin cậy:

- High
- Medium
- Low

Nếu Confidence là Medium hoặc Low thì phải ghi thêm:

"Cần xác minh thêm."

--------------------------------------------------------

# Priority Issues

Liệt kê tối đa 3 vấn đề quan trọng nhất.

Mỗi vấn đề gồm:

## Issue X

Priority:

- High
- Medium
- Low

Description:

...

Business Impact:

...

Không suy diễn nguyên nhân.

--------------------------------------------------------

# Recommended Actions

Đưa ra tối đa 5 hành động.

Mỗi hành động gồm:

## Action X

Recommendation:

...

Based On:

Insight số ...

Expected Outcome:

Ví dụ:

- Giảm tỷ lệ hủy
- Tăng booking
- Tăng doanh thu
- Kiểm tra dữ liệu
- Điều tra nguyên nhân
- Theo dõi KPI
- Cải thiện tỷ lệ chuyển đổi booking

Nếu dữ liệu chưa đủ thì ưu tiên:

- Điều tra nguyên nhân
- Kiểm tra dữ liệu
- Thu thập thêm dữ liệu
- Theo dõi KPI

Không đề xuất giải pháp cụ thể nếu chưa có đủ bằng chứng.

--------------------------------------------------------

# Conclusion

Viết tối đa 3 câu.

Bao gồm:

- Đánh giá tổng quan.
- Nội dung cần ưu tiên xử lý.
- Nội dung cần tiếp tục theo dõi.

========================================================
FORMAT
========================================================

Trả về Markdown.

Chỉ sử dụng các Heading sau:

# Executive Summary

# Business Insights

# Priority Issues

# Recommended Actions

# Conclusion

Không sử dụng:

- Emoji
- Icon Unicode
- Ký tự trang trí
- Banner ASCII

Ưu tiên:

- Heading
- Bullet List
- Numbered List

Không sử dụng bảng nếu không thật sự cần thiết.

========================================================
WRITING STYLE
========================================================

Phong cách viết phải giống báo cáo Business Intelligence trong doanh nghiệp.

Yêu cầu:

- Chuyên nghiệp
- Khách quan
- Ngắn gọn
- Rõ ràng
- Tập trung vào Insight
- Không lan man
- Không lặp ý
- Không giải thích từng dòng dữ liệu
- Không vượt quá 700 từ
- Viết hoàn toàn bằng tiếng Việt

========================================================
SELF VALIDATION
========================================================

Trước khi trả lời, hãy tự kiểm tra:

1. Có Insight nào không có Evidence không?

2. Có câu nào đang suy diễn nguyên nhân không?

3. Có lời khuyên nào không xuất phát từ Insight không?

4. Có kết luận nào vượt quá phạm vi dữ liệu không?

Nếu có, hãy sửa trước khi trả lời.
`;
        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: systemPrompt,
            });
            return response.text || "Không thể phân tích dữ liệu lúc này.";
        }
        catch (error) {
            console.error("[AiAnalyticsService] Lỗi kết nối Gemini:", error);
            throw new BadRequestError("Lỗi khi kết nối với AI Model. Vui lòng thử lại sau.");
        }
    }
}
