import { MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import CalendarDropdown from "./CalendarDropdown";
import GuestsDropdown from "./GuestsDropdown";

export default function SearchHeader() {
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
    <div className="w-full bg-slate-900 pt-24 pb-8 border-b border-slate-800 relative z-20">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="w-full bg-white rounded-xl p-1.5 flex flex-col md:flex-row shadow-lg items-center gap-1.5">
          <div className="flex-[1.2] w-full flex items-center gap-3 px-4 py-2 bg-slate-50 hover:bg-slate-100 transition rounded-lg cursor-text">
            <MapPin className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              defaultValue="Hà Nội"
              placeholder="Thành phố, khách sạn, điểm đến" 
              className="w-full bg-transparent outline-none text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>
          
          <div 
            className={`flex-1 w-full flex items-center px-4 py-2 transition rounded-lg relative ${isCalendarOpen ? 'bg-blue-50 ring-2 ring-primary' : 'bg-slate-50 hover:bg-slate-100'}`}
            ref={calendarRef}
          >
            <div 
              className="flex items-center gap-3 w-full h-full cursor-pointer" 
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            >
              <Calendar className="w-5 h-5 text-slate-500" />
              <div className="text-slate-900 font-bold whitespace-nowrap">
                18 Thg 7 - 19 Thg 7
              </div>
            </div>
            {isCalendarOpen && <CalendarDropdown onClose={() => setIsCalendarOpen(false)} />}
          </div>

          <div 
            className={`flex-1 w-full flex items-center px-4 py-2 transition rounded-lg relative ${isGuestsOpen ? 'bg-blue-50 ring-2 ring-primary' : 'bg-slate-50 hover:bg-slate-100'}`}
            ref={guestsRef}
          >
            <div 
              className="flex items-center gap-3 w-full h-full cursor-pointer"
              onClick={() => setIsGuestsOpen(!isGuestsOpen)}
            >
              <Users className="w-5 h-5 text-slate-500" />
              <div className="text-slate-900 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                2 người lớn, 0 trẻ em, 1 phòng
              </div>
            </div>
            {isGuestsOpen && <GuestsDropdown onClose={() => setIsGuestsOpen(false)} />}
          </div>

          <Button className="h-11 w-full md:w-auto px-8 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-md font-bold text-lg">
            Tìm kiếm
          </Button>
        </div>

      </div>
    </div>
  );
}
