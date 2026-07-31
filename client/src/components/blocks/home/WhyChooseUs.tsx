import { BadgeCheck, BedDouble, CalendarCheck, SearchCheck } from "lucide-react";

const features = [
  {
    icon: <SearchCheck className="w-8 h-8 text-primary" />,
    title: "Tìm kiếm dễ dàng",
    description: "Tìm chỗ nghỉ theo điểm đến, ngày lưu trú và số lượng khách chỉ trong vài bước.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <BedDouble className="w-8 h-8 text-primary" />,
    title: "Thông tin phòng rõ ràng",
    description: "Xem loại phòng, sức chứa, mức giá và số phòng còn trống trước khi đặt.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-primary" />,
    title: "Đặt phòng nhanh chóng",
    description: "Hoàn tất thông tin lưu trú và nhận mã đặt phòng ngay sau khi xác nhận.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <BadgeCheck className="w-8 h-8 text-primary" />,
    title: "Quản lý thuận tiện",
    description: "Theo dõi lịch sử, trạng thái và chủ động hủy các đặt phòng đủ điều kiện.",
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
            Các bước từ tìm kiếm đến quản lý đặt phòng được thiết kế rõ ràng và thuận tiện.
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
