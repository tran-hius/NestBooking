import { ShieldCheck, Tag, HeadphonesIcon, Globe2 } from "lucide-react";

const features = [
  {
    icon: <Tag className="w-8 h-8 text-primary" />,
    title: "Giá rẻ mỗi ngày",
    description: "Luôn có các chương trình khuyến mãi và giá tốt nhất cho chuyến đi của bạn.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "Thanh toán an toàn",
    description: "Hệ thống thanh toán bảo mật 100%, hỗ trợ đa dạng các cổng thanh toán uy tín.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <Globe2 className="w-8 h-8 text-primary" />,
    title: "Mạng lưới toàn cầu",
    description: "Kết nối hơn 1.2 triệu khách sạn và hàng ngàn chuyến bay trên toàn thế giới.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8 text-primary" />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chuyên viên chăm sóc khách hàng luôn sẵn sàng hỗ trợ bất cứ lúc nào.",
    bgColor: "bg-blue-50"
  }
];

export default function WhyChooseUs() {
  return (
    <section className="w-full py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Tại sao chọn NestBooking?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Chúng tôi cam kết mang lại trải nghiệm đặt phòng dễ dàng, an toàn và tiết kiệm nhất cho hàng triệu khách hàng tin dùng mỗi ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${feature.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
