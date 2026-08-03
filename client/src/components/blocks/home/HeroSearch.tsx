import { Building2, Calendar, CheckCircle2, MapPin, Search, ShieldCheck, Users } from "lucide-react";
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
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
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
    if ((checkIn || checkOut) && (!checkIn || !checkOut || checkOut <= checkIn)) {
      toast.error("Vui lòng chọn ngày nhận và trả phòng hợp lệ");
      return;
    }

    const params: Record<string, string> = {
      location: location.trim(),
      adults: String(guests.adults),
      children: String(guests.children),
      rooms: String(guests.rooms),
    };
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    
    const searchParams = new URLSearchParams(params);
    navigate(`/search?${searchParams.toString()}`);
  };

  const formatDateRange = () => {
    const formatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" });
    const format = (dateStr: string) => dateStr ? formatter.format(new Date(`${dateStr}T00:00:00`)) : "Chọn ngày";
    return `${format(checkIn)} - ${format(checkOut)}`;
  };

  return (
    <section className="relative z-20 flex min-h-[720px] w-full isolate items-center pt-24 md:min-h-[680px] md:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HeaderBanner})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#031b3d]/95 via-[#063b70]/75 to-[#061d3a]/25" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-50 to-transparent" />
        <div className="absolute -right-20 top-28 h-72 w-72 rounded-full border border-white/15" />
        <div className="absolute -right-5 top-44 h-44 w-44 rounded-full border border-white/10" />
      </div>

      <div className="container relative z-20 py-14">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-md"><ShieldCheck className="h-4 w-4" />Đặt phòng trực tiếp trên NestBooking</div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">Chỗ nghỉ phù hợp cho <span className="text-cyan-300">hành trình của bạn.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-50/90 sm:text-lg">Tìm kiếm theo điểm đến, ngày lưu trú và số khách. So sánh loại phòng trước khi hoàn tất đặt chỗ.</p>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" />Dữ liệu chỗ nghỉ đang hoạt động</span><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" />Theo dõi booking trong tài khoản</span></div>

          <div className="relative z-50 mt-9 w-full rounded-[24px] border border-white/20 bg-white/95 p-2.5 shadow-[0_24px_70px_rgba(2,20,45,0.35)] backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2 px-2 py-1 text-xs font-bold uppercase tracking-[0.13em] text-slate-500"><Building2 className="h-4 w-4 text-primary" />Tìm chỗ nghỉ</div>
            <div className="relative grid gap-2 lg:grid-cols-[1.25fr_.8fr_1fr_auto]">
              <LocationInput value={location} onChange={setLocation} onSubmit={handleSearch} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5" inputClassName="font-semibold text-slate-900" iconClassName="text-primary" />
              <div ref={calendarRef} className={`relative flex min-w-0 items-center rounded-2xl border px-4 py-3.5 transition ${isCalendarOpen ? "border-primary bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 bg-slate-50 hover:border-blue-300"}`}>
              <button type="button" className="flex w-full min-w-0 items-center gap-3 text-left" onClick={() => setIsCalendarOpen((open) => !open)}><Calendar className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Ngày lưu trú</span><span className="block truncate font-semibold text-slate-900">{formatDateRange()}</span></span></button>
              {isCalendarOpen && <CalendarDropdown checkIn={checkIn} checkOut={checkOut} onChange={(nextIn, nextOut) => { setCheckIn(nextIn); setCheckOut(nextOut); }} onClose={() => setIsCalendarOpen(false)} />}
            </div>
            <div ref={guestsRef} className={`relative flex min-w-0 items-center rounded-2xl border px-4 py-3.5 transition ${isGuestsOpen ? "border-primary bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 bg-slate-50 hover:border-blue-300"}`}>
              <button type="button" className="flex w-full min-w-0 items-center gap-3 text-left" onClick={() => setIsGuestsOpen((open) => !open)}><Users className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Khách & phòng</span><span className="block truncate font-semibold text-slate-900">{guests.adults + guests.children} khách, {guests.rooms} phòng</span></span></button>
              {isGuestsOpen && <GuestsDropdown {...guests} onChange={setGuests} onClose={() => setIsGuestsOpen(false)} />}
            </div>
              <Button type="button" onClick={handleSearch} className="h-auto min-h-14 rounded-2xl bg-[#087fd1] px-7 text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#056eb8]"><Search className="h-5 w-5" />Tìm kiếm</Button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-blue-50/80"><MapPin className="h-4 w-4 text-cyan-300" /><span>Gợi ý phổ biến:</span>{["Hà Nội", "Đà Nẵng", "Hạ Long"].map((item) => <button key={item} type="button" onClick={() => setLocation(item)} className="font-semibold text-white underline-offset-4 hover:underline">{item}</button>)}</div>
        </div>
      </div>
    </section>
  );
}
