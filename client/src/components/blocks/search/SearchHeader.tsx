import { Calendar, Search, SlidersHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CalendarDropdown from "./CalendarDropdown";
import GuestsDropdown, { GuestSelection } from "./GuestsDropdown";
import { useClickOutside } from "@/hooks/useClickOutside";
import LocationInput from "./LocationInput";

const isoToInput = (value: string | null, fallback: string) => value ? new Date(value).toISOString().slice(0, 10) : fallback;

export default function SearchHeader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const [location, setLocation] = useState(searchParams.get("location") || "Hà Nội");
  const [checkIn, setCheckIn] = useState(isoToInput(searchParams.get("checkIn"), tomorrow.toISOString().slice(0, 10)));
  const [checkOut, setCheckOut] = useState(isoToInput(searchParams.get("checkOut"), dayAfterTomorrow.toISOString().slice(0, 10)));
  const [guests, setGuests] = useState<GuestSelection>({
    adults: Number(searchParams.get("adults") || 2),
    children: Number(searchParams.get("children") || 0),
    rooms: Number(searchParams.get("rooms") || 1),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useClickOutside(calendarRef, () => setIsCalendarOpen(false));
  useClickOutside(guestsRef, () => setIsGuestsOpen(false));

  const submitSearch = () => {
    setSearchParams({
      location: location.trim(),
      checkIn: new Date(`${checkIn}T00:00:00`).toISOString(),
      checkOut: new Date(`${checkOut}T00:00:00`).toISOString(),
      adults: String(guests.adults),
      children: String(guests.children),
      rooms: String(guests.rooms),
    });
  };

  return (
    <section className="relative z-30 w-full border-b border-blue-950 bg-[#05285d] pb-7 pt-24 text-white">
      <div className="absolute inset-0 overflow-hidden"><div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" /><div className="absolute right-12 top-4 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" /></div>
      <div className="container relative">
        <div className="mb-5"><div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300"><SlidersHorizontal className="h-4 w-4" />Điều chỉnh tìm kiếm</div><h1 className="text-2xl font-black tracking-tight md:text-3xl">Tìm chỗ nghỉ còn phòng</h1></div>
        <div className="grid w-full gap-2 rounded-[22px] border border-white/15 bg-white p-2.5 shadow-[0_20px_55px_rgba(1,15,35,0.28)] lg:grid-cols-[1.25fr_.8fr_1fr_auto]">
          <LocationInput value={location} onChange={setLocation} onSubmit={submitSearch} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" inputClassName="font-semibold text-slate-900" iconClassName="text-primary" />
          <div ref={calendarRef} className={`relative flex min-w-0 items-center rounded-2xl border px-4 py-3 transition ${isCalendarOpen ? "border-primary bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 bg-slate-50 hover:border-blue-300"}`}>
            <button type="button" className="flex w-full min-w-0 items-center gap-3 text-left" onClick={() => setIsCalendarOpen((open) => !open)}><Calendar className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Ngày lưu trú</span><span className="block truncate text-sm font-semibold text-slate-900">{formatDate(checkIn)} - {formatDate(checkOut)}</span></span></button>
            {isCalendarOpen && <CalendarDropdown checkIn={checkIn} checkOut={checkOut} onChange={(nextIn, nextOut) => { setCheckIn(nextIn); setCheckOut(nextOut); }} onClose={() => setIsCalendarOpen(false)} />}
          </div>
          <div ref={guestsRef} className={`relative flex min-w-0 items-center rounded-2xl border px-4 py-3 transition ${isGuestsOpen ? "border-primary bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 bg-slate-50 hover:border-blue-300"}`}>
            <button type="button" className="flex w-full min-w-0 items-center gap-3 text-left" onClick={() => setIsGuestsOpen((open) => !open)}><Users className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Khách & phòng</span><span className="block truncate text-sm font-semibold text-slate-900">{guests.adults + guests.children} khách, {guests.rooms} phòng</span></span></button>
            {isGuestsOpen && <GuestsDropdown {...guests} onChange={setGuests} onClose={() => setIsGuestsOpen(false)} />}
          </div>
          <Button type="button" onClick={submitSearch} disabled={!location.trim() || !checkIn || !checkOut || checkOut <= checkIn} className="min-h-14 rounded-2xl px-7 text-base font-bold text-white"><Search className="h-5 w-5" />Tìm lại</Button>
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(`${value}T00:00:00`));
}
