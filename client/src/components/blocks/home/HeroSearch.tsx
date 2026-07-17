import { Building2, MapPin, Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderBanner from "@/assets/HeaderBanner.jpg";
import { useState, useRef, useEffect } from "react";
import CalendarDropdown from "../search/CalendarDropdown";
import GuestsDropdown from "../search/GuestsDropdown";

export default function HeroSearch() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setIsGuestsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="relative w-full h-[550px] flex flex-col items-center justify-center pt-20">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/10"
        style={{ backgroundImage: `url(${HeaderBanner})` }}
      />
      
      <div className="relative z-50 container mx-auto px-4 md:px-8 flex flex-col items-center mt-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Ứng dụng du lịch hàng đầu – Một chạm, vạn điểm đến
        </h1>

        <div className="w-full max-w-5xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/20 text-white font-semibold backdrop-blur-md border border-white/30 hover:bg-white/30 transition">
              <Building2 className="w-5 h-5" />
              Khách sạn
            </button>
          </div>

          <div className="flex w-full text-white text-sm font-medium mb-2 px-2 hidden md:flex drop-shadow-md">
            <div className="w-2/5">Thành phố, điểm đến, hoặc tên khách sạn</div>
            <div className="w-1/4">Ngày nhận & trả phòng</div>
            <div className="w-1/4">Khách và Phòng</div>
          </div>

          <div className="w-full bg-white rounded-2xl p-2 flex flex-col md:flex-row shadow-2xl items-center gap-2 relative">
            <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition rounded-xl cursor-text">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Thành phố, khách sạn, điểm đến" 
                className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            
            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

            <div 
              className={`flex-[0.7] w-full flex items-center px-4 py-3 transition rounded-xl relative ${isCalendarOpen ? 'bg-blue-50 ring-2 ring-primary' : 'bg-slate-50 hover:bg-slate-100'}`}
              ref={calendarRef}
            >
              <div 
                className="flex items-center gap-3 w-full h-full cursor-pointer" 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                <Calendar className="w-5 h-5 text-primary" />
                <div className="text-slate-700 font-medium whitespace-nowrap">
                  18 Thg 7 - 19 Thg 7
                </div>
              </div>
              {isCalendarOpen && <CalendarDropdown onClose={() => setIsCalendarOpen(false)} />}
            </div>

            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

            <div 
              className={`flex-[0.7] w-full flex items-center px-4 py-3 transition rounded-xl relative ${isGuestsOpen ? 'bg-blue-50 ring-2 ring-primary' : 'bg-slate-50 hover:bg-slate-100'}`}
              ref={guestsRef}
            >
              <div 
                className="flex items-center gap-3 w-full h-full cursor-pointer"
                onClick={() => setIsGuestsOpen(!isGuestsOpen)}
              >
                <Users className="w-5 h-5 text-primary" />
                <div className="text-slate-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  2 người lớn, 0 trẻ em, 1 phòng
                </div>
              </div>
              {isGuestsOpen && <GuestsDropdown onClose={() => setIsGuestsOpen(false)} />}
            </div>

            <Button className="h-12 w-full md:w-auto px-8 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/30">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
