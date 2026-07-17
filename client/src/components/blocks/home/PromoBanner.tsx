import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromoBanner() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-12 flex flex-col items-center">
      <div className="w-full bg-gradient-to-r from-blue-600 to-primary rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between text-white shadow-2xl relative">
        
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          
          {/* Decorative pattern */}
          <svg className="absolute right-0 h-full w-1/2 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,70 70,30 100,0 L100,100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 p-8 md:p-12 flex-1 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white">Ưu đãi độc quyền</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight text-white drop-shadow-md">
            Du lịch siêu chất <br/> Đón hè cực chill
          </h2>
          
          <p className="text-white/90 text-lg mb-8 max-w-md">
            Giảm ngay đến 30% cho các đặt phòng tại Phú Quốc, Nha Trang và Đà Nẵng. Áp dụng đến hết tháng này!
          </p>
          
          <Button className="h-12 px-8 bg-white hover:bg-slate-100 text-primary font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">
            Săn deal ngay
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        
        <div className="relative z-10 hidden md:block w-1/3 p-8">
          <div className="w-full aspect-square bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center -rotate-6 hover:rotate-0 transition-transform duration-500">
            <div className="text-center p-6">
              <div className="text-5xl font-black text-white mb-2">-30%</div>
              <div className="text-white/80 font-medium uppercase tracking-widest text-sm">Sale lớn nhất năm</div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
