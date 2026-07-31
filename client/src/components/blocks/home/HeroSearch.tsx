import { Building2, Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderBanner from "@/assets/HeaderBanner.jpg";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CalendarDropdown from "../search/CalendarDropdown";
import GuestsDropdown, { GuestSelection } from "../search/GuestsDropdown";
import { useClickOutside } from "@/hooks/useClickOutside";
import LocationInput from "../search/LocationInput";

const toDateInput = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

export default function HeroSearch() {
  const navigate = useNavigate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const [location, setLocation] = useState("Hà Nội");
  const [checkIn, setCheckIn] = useState(toDateInput(tomorrow));
  const [checkOut, setCheckOut] = useState(toDateInput(dayAfterTomorrow));
  const [guests, setGuests] = useState<GuestSelection>({ adults: 2, children: 0, rooms: 1 });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useClickOutside(calendarRef, () => setIsCalendarOpen(false));
  useClickOutside(guestsRef, () => setIsGuestsOpen(false));

  const handleSearch = () => {
    if (!location.trim()) {
      toast.error("Vui lòng nhập điểm đến");
      return;
    }
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      toast.error("Vui lòng chọn ngày nhận và trả phòng hợp lệ");
      return;
    }

    const params = new URLSearchParams({
      location: location.trim(),
      checkIn: new Date(`${checkIn}T00:00:00`).toISOString(),
      checkOut: new Date(`${checkOut}T00:00:00`).toISOString(),
      adults: String(guests.adults),
      children: String(guests.children),
      rooms: String(guests.rooms),
    });
    navigate(`/search?${params.toString()}`);
  };

  const formatDateRange = () => {
    const formatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" });
    return `${formatter.format(new Date(`${checkIn}T00:00:00`))} - ${formatter.format(new Date(`${checkOut}T00:00:00`))}`;
  };

  return (
    <section className="relative flex min-h-[650px] w-full flex-col items-center justify-center pt-24 md:min-h-[550px] md:pt-20">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/10" style={{ backgroundImage: `url(${HeaderBanner})` }} />
      <div className="container relative z-50 mx-auto mt-8 flex flex-col items-center px-4 md:px-8">
        <h1 className="mb-10 text-center text-3xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] md:text-5xl">Tìm chỗ nghỉ phù hợp cho chuyến đi của bạn</h1>
        <div className="flex w-full max-w-5xl flex-col">
          <div className="mb-4 flex items-center gap-2">
            <button type="button" className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-6 py-2.5 font-semibold text-white backdrop-blur-md"><Building2 className="h-5 w-5" />Khách sạn</button>
          </div>
          <div className="relative flex w-full flex-col items-center gap-2 rounded-2xl bg-background p-2 shadow-2xl md:flex-row">
            <LocationInput value={location} onChange={setLocation} onSubmit={handleSearch} className="flex-1 rounded-xl bg-slate-50 px-4 py-3" inputClassName="font-medium text-foreground" />
            <div ref={calendarRef} className={`relative flex w-full flex-[0.7] items-center rounded-xl px-4 py-3 ${isCalendarOpen ? "bg-primary/10 ring-2 ring-primary" : "bg-slate-50"}`}>
              <button type="button" className="flex w-full items-center gap-3" onClick={() => setIsCalendarOpen((open) => !open)}><Calendar className="h-5 w-5 text-primary" /><span className="font-medium text-foreground">{formatDateRange()}</span></button>
              {isCalendarOpen && <CalendarDropdown checkIn={checkIn} checkOut={checkOut} onChange={(nextIn, nextOut) => { setCheckIn(nextIn); setCheckOut(nextOut); }} onClose={() => setIsCalendarOpen(false)} />}
            </div>
            <div ref={guestsRef} className={`relative flex w-full flex-[0.7] items-center rounded-xl px-4 py-3 ${isGuestsOpen ? "bg-primary/10 ring-2 ring-primary" : "bg-slate-50"}`}>
              <button type="button" className="flex w-full items-center gap-3" onClick={() => setIsGuestsOpen((open) => !open)}><Users className="h-5 w-5 text-primary" /><span className="truncate font-medium text-foreground">{guests.adults} người lớn, {guests.children} trẻ em, {guests.rooms} phòng</span></button>
              {isGuestsOpen && <GuestsDropdown {...guests} onChange={setGuests} onClose={() => setIsGuestsOpen(false)} />}
            </div>
            <Button type="button" onClick={handleSearch} className="h-12 w-full rounded-xl px-8 text-white md:w-auto"><Search className="h-5 w-5" /><span className="md:hidden">Tìm kiếm</span></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
