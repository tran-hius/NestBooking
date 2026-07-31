import { ArrowRight, Compass, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import HaNoi from "@/assets/HaNoi.jpg";
import HaLong from "@/assets/HaLong.jpg";
import DaNang from "@/assets/DaNang.jpg";
import NinhBinh from "@/assets/NinhBinh.jpg";
import CatBa from "@/assets/CatBa.jpg";

export default function ExploreVietnam() {
  const navigate = useNavigate();
  const images = [
    { src: HaNoi, name: "Hà Nội", classes: "col-span-7 row-span-2" },
    { src: HaLong, name: "Hạ Long", classes: "col-span-5" },
    { src: DaNang, name: "Đà Nẵng", classes: "col-span-5" },
    { src: NinhBinh, name: "Ninh Bình", classes: "col-span-5" },
    { src: CatBa, name: "Cát Bà", classes: "col-span-7" },
  ];

  const searchDestination = (location?: string) => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    navigate(`/search${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative z-0 overflow-hidden bg-slate-50 py-20 md:py-24">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
          <div className="relative z-20">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-700"><Compass className="h-4 w-4" />Cảm hứng Việt Nam</div>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">Mỗi điểm đến, <span className="text-primary">một nhịp sống riêng.</span></h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">Từ phố cổ, vịnh biển đến những thành phố ven sông. Chọn nơi bạn muốn đến và bắt đầu với các chỗ nghỉ đang mở đặt phòng.</p>
            <div className="mt-7 flex flex-wrap gap-2">{["Biển", "Thành phố", "Thiên nhiên"].map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600">{item}</span>)}</div>
            <Button type="button" onClick={() => searchDestination()} className="group mt-8 h-12 rounded-xl px-6 font-bold text-white shadow-lg shadow-primary/20">Khám phá chỗ nghỉ<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Button>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-cyan-200/35 blur-3xl" />
            <div className="relative grid h-[430px] grid-cols-12 grid-rows-3 gap-3 sm:h-[520px] sm:gap-4">
              {images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => searchDestination(img.name)}
                  aria-label={`Tìm chỗ nghỉ tại ${img.name}`}
                  className={`group relative overflow-hidden rounded-[22px] border-4 border-white text-left shadow-xl ${img.classes}`}
                >
                  <img 
                    src={img.src} 
                    alt={img.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 text-white sm:p-4"><MapPin className="h-4 w-4 shrink-0 text-cyan-300" /><h3 className="font-bold sm:text-lg">{img.name}</h3></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
