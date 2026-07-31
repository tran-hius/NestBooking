import { Calendar, Users } from "lucide-react";
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
    <div className="relative z-20 w-full border-b border-slate-800 bg-slate-900 pb-8 pt-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex w-full flex-col items-center gap-1.5 rounded-xl bg-white p-1.5 shadow-lg md:flex-row">
          <LocationInput value={location} onChange={setLocation} onSubmit={submitSearch} className="flex-[1.2] rounded-lg bg-slate-50 px-4 py-2" inputClassName="font-bold text-slate-900" iconClassName="text-slate-400" />
          <div ref={calendarRef} className={`relative flex w-full flex-1 items-center rounded-lg px-4 py-2 ${isCalendarOpen ? "bg-blue-50 ring-2 ring-primary" : "bg-slate-50"}`}>
            <button type="button" className="flex w-full items-center gap-3" onClick={() => setIsCalendarOpen((open) => !open)}><Calendar className="h-5 w-5 text-slate-500" /><span className="font-bold text-slate-900">{checkIn} - {checkOut}</span></button>
            {isCalendarOpen && <CalendarDropdown checkIn={checkIn} checkOut={checkOut} onChange={(nextIn, nextOut) => { setCheckIn(nextIn); setCheckOut(nextOut); }} onClose={() => setIsCalendarOpen(false)} />}
          </div>
          <div ref={guestsRef} className={`relative flex w-full flex-1 items-center rounded-lg px-4 py-2 ${isGuestsOpen ? "bg-blue-50 ring-2 ring-primary" : "bg-slate-50"}`}>
            <button type="button" className="flex w-full items-center gap-3" onClick={() => setIsGuestsOpen((open) => !open)}><Users className="h-5 w-5 text-slate-500" /><span className="truncate font-bold text-slate-900">{guests.adults} người lớn, {guests.children} trẻ em, {guests.rooms} phòng</span></button>
            {isGuestsOpen && <GuestsDropdown {...guests} onChange={setGuests} onClose={() => setIsGuestsOpen(false)} />}
          </div>
          <Button type="button" onClick={submitSearch} disabled={!location.trim() || !checkIn || !checkOut || checkOut <= checkIn} className="h-11 w-full rounded-lg px-8 text-lg font-bold text-white md:w-auto">Tìm kiếm</Button>
        </div>
      </div>
    </div>
  );
}
