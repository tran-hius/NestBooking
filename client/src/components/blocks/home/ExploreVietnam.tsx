import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import HaNoi from "@/assets/HaNoi.jpg";
import HaLong from "@/assets/HaLong.jpg";
import DaNang from "@/assets/DaNang.jpg";
import NinhBinh from "@/assets/NinhBinh.jpg";
import CatBa from "@/assets/CatBa.jpg";

export default function ExploreVietnam() {
  const images = [
    { src: HaNoi, name: "Hà Nội", classes: "col-span-6 md:col-span-4 aspect-[4/5] -rotate-2 hover:rotate-0 hover:z-10 transition-all duration-500 shadow-xl rounded-2xl" },
    { src: HaLong, name: "Hạ Long", classes: "col-span-6 md:col-span-3 aspect-square rotate-3 hover:rotate-0 hover:z-10 transition-all duration-500 shadow-lg rounded-2xl md:mt-12" },
    { src: DaNang, name: "Đà Nẵng", classes: "col-span-6 md:col-span-5 aspect-video -rotate-1 hover:rotate-0 hover:z-10 transition-all duration-500 shadow-2xl rounded-2xl md:-ml-8 md:mt-24" },
    { src: NinhBinh, name: "Ninh Bình", classes: "col-span-6 md:col-span-5 aspect-[16/10] rotate-2 hover:rotate-0 hover:z-10 transition-all duration-500 shadow-xl rounded-2xl md:-mt-16" },
    { src: CatBa, name: "Cát Bà", classes: "col-span-6 md:col-span-7 aspect-[21/9] -rotate-1 hover:rotate-0 hover:z-10 transition-all duration-500 shadow-2xl rounded-2xl md:-ml-12" },
  ];

  return (
    <section className="py-20 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          {/* Text Content */}
          <div className="w-full md:w-1/3 space-y-6 z-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Khám phá <br />
              <span className="text-primary">Việt Nam</span> <br />
              đẹp bất tận.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Từ những thửa ruộng bậc thang ngút ngàn ở Tây Bắc, 
              đến những bãi biển cát trắng nắng vàng miền Trung. 
              Mỗi vùng đất là một câu chuyện đang chờ bạn khám phá.
            </p>
            <Button className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 group">
              Lên lịch trình ngay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Jumbled Collage */}
          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-12 gap-4 md:gap-6 relative">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`relative overflow-hidden group cursor-pointer ${img.classes}`}
                >
                  <img 
                    src={img.src} 
                    alt={img.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="absolute bottom-6 left-6 text-2xl font-black text-white drop-shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {img.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
