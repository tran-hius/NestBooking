import { Star, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    role: "Khách hàng thường xuyên",
    content: "NestBooking thực sự là một nền tảng tuyệt vời. Tôi đã đặt phòng khách sạn ở Đà Nẵng và được giảm giá rất sâu, dịch vụ lại hỗ trợ tận tình.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 2,
    name: "Trần Thị B",
    role: "Travel Blogger",
    content: "Giao diện siêu mượt, rất dễ sử dụng trên điện thoại. Tôi đặc biệt thích tính năng tìm kiếm các khách sạn đang có khuyến mãi.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 3,
    name: "Lê Hoàng C",
    role: "Gia đình du lịch",
    content: "Vừa book phòng cho cả gia đình đi Phú Quốc. Quá trình thanh toán mượt mà, xác nhận nhanh chóng. Rất yên tâm khi dùng ứng dụng này.",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?img=15"
  }
];

export default function Reviews() {
  return (
    <section className="w-full py-16 bg-slate-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Khách hàng nói gì về chúng tôi</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Hàng ngàn đánh giá tích cực từ những người đã trải nghiệm dịch vụ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-100 rotate-180" />
              
              <div className="flex gap-1 mb-6 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < review.rating ? "fill-current" : "text-slate-200"}`} />
                ))}
              </div>
              
              <p className="text-slate-600 mb-8 leading-relaxed italic relative z-10">
                "{review.content}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <img 
                  src={review.avatar} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{review.name}</h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
