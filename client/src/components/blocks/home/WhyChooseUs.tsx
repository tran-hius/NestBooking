import { ArrowRight, BadgeCheck, BedDouble, CalendarCheck, SearchCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: <SearchCheck className="w-8 h-8 text-primary" />,
    title: "Tìm kiếm dễ dàng",
    description: "Tìm chỗ nghỉ theo điểm đến, ngày lưu trú và số lượng khách chỉ trong vài bước.",
    step: "01"
  },
  {
    icon: <BedDouble className="w-8 h-8 text-primary" />,
    title: "Thông tin phòng rõ ràng",
    description: "Xem loại phòng, sức chứa, mức giá và số phòng còn trống trước khi đặt.",
    step: "02"
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-primary" />,
    title: "Đặt phòng nhanh chóng",
    description: "Hoàn tất thông tin lưu trú và nhận mã đặt phòng ngay sau khi xác nhận.",
    step: "03"
  },
  {
    icon: <BadgeCheck className="w-8 h-8 text-primary" />,
    title: "Quản lý thuận tiện",
    description: "Theo dõi lịch sử, trạng thái và chủ động hủy các đặt phòng đủ điều kiện.",
    step: "04"
  }
];

export default function WhyChooseUs() {
  const navigate = useNavigate();
  return (
    <section className="w-full bg-[#05285d] py-20 text-white md:py-24">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Hành trình đặt phòng</div><h2 className="max-w-xl text-3xl font-black tracking-tight md:text-4xl">Từ tìm kiếm đến quản lý chuyến đi trong một luồng rõ ràng.</h2></div>
          <button type="button" onClick={() => navigate("/search")} className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-[#05285d]">Bắt đầu tìm kiếm<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.1]">
              <div className="mb-8 flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary">{feature.icon}</div><span className="text-3xl font-black text-white/15">{feature.step}</span></div>
              <h3 className="mb-3 text-lg font-bold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-blue-100/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
