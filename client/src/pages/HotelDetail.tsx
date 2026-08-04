import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Expand,
  Home,
  ImageOff,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
  X,
} from "lucide-react";
import { hotelService } from "@/api/services/hotelService";
import { bookingService } from "@/api/services/bookingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Hotel, RoomType } from "@/types";
import { toast } from "sonner";

const getPropertyLabels = (t: any): Record<string, string> => ({
  HOTEL: t("enums.PropertyType.HOTEL"),
  RESORT: t("enums.PropertyType.RESORT"),
  VILLA: t("enums.PropertyType.VILLA"),
  APARTMENT: t("enums.PropertyType.APARTMENT"),
  HOMESTAY: t("enums.PropertyType.HOMESTAY"),
  GUESTHOUSE: t("enums.PropertyType.GUESTHOUSE"),
  MOTEL: t("enums.PropertyType.MOTEL"),
  CAMPING: t("enums.PropertyType.CAMPING"),
  GLAMPING: t("enums.PropertyType.GLAMPING"),
  CRUISE: t("enums.PropertyType.CRUISE"),
  ENTIRE_HOUSE: t("enums.PropertyType.ENTIRE_HOUSE"),
});

const getBedLabels = (t: any): Record<string, string> => ({
  SINGLE: t("enums.BedType.SINGLE"),
  DOUBLE: t("enums.BedType.DOUBLE"),
  QUEEN: t("enums.BedType.QUEEN"),
  KING: t("enums.BedType.KING"),
  TWIN: t("enums.BedType.TWIN"),
  BUNK: t("enums.BedType.BUNK"),
});

const fallbackImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1582719478250-c8940026e7ae?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85",
];

export default function HotelDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, number>>({});

  const checkIn = parseDate(searchParams.get("checkIn"), 1);
  const checkOut = parseDate(searchParams.get("checkOut"), 2);

  useEffect(() => {
    if (!id) return;
    const fetchHotelAndAvailability = async () => {
      setLoading(true);
      try {
        const [hotelRes, availabilityRes] = await Promise.all([
          hotelService.getHotelById(id),
          bookingService.getHotelAvailability(id, checkIn.toISOString(), checkOut.toISOString()).catch(() => ({ data: {} }))
        ]);
        setHotel(hotelRes.data);
        setAvailabilityMap(availabilityRes.data || {});
      } catch (error: any) {
        toast.error(error.response?.data?.message || t("hotelDetail.errLoad"));
      } finally {
        setLoading(false);
      }
    };
    void fetchHotelAndAvailability();
  }, [id, searchParams]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-20"><div className="text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" /><p className="mt-3 text-sm text-slate-500">{t("hotelDetail.loading")}</p></div></div>;
  if (!hotel) return <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 pt-20 text-center"><Building2 className="h-12 w-12 text-slate-300" /><h1 className="mt-4 text-2xl font-bold text-slate-800">{t("hotelDetail.notFoundTitle")}</h1><p className="mt-2 text-slate-500">{t("hotelDetail.notFoundDesc")}</p><Button onClick={() => navigate("/search")} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" />{t("hotelDetail.backToSearch")}</Button></div>;

  const adults = Number(searchParams.get("adults") || 2);
  const children = Number(searchParams.get("children") || 0);
  const rooms = Number(searchParams.get("rooms") || 1);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));
  const roomTypes = (hotel.roomTypes || []).filter((roomType) => roomType.isActive);
  const images = getHotelImages(hotel);

  const handleBookNow = (roomType: RoomType, qty: number = rooms) => {
    navigate("/checkout", {
      state: {
        hotelId: hotel.id,
        roomTypeId: roomType.id,
        hotel,
        roomType,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        adults,
        children,
        rooms: qty,
      },
    });
  };

  const openGallery = (index: number) => {
    setActiveImage(index);
    setGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] pb-20 pt-24">
      <div className="container">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb"><Link to="/" className="rounded-lg px-2 py-1 hover:bg-white hover:text-primary">{t("hotelDetail.home")}</Link><ChevronRight className="h-3.5 w-3.5 text-slate-300" /><Link to={`/search${searchParams.size ? `?${searchParams.toString()}` : ""}`} className="rounded-lg px-2 py-1 hover:bg-white hover:text-primary">{t("hotelDetail.search")}</Link><ChevronRight className="h-3.5 w-3.5 text-slate-300" /><span className="max-w-52 truncate rounded-lg bg-white px-2 py-1 text-slate-700 shadow-sm">{hotel.name}</span></nav>

        <header className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0"><div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">{getPropertyLabels(t)[hotel.propertyType] || hotel.propertyType}</Badge>{hotel.rating && hotel.rating > 0 ? <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{hotel.rating.toFixed(1)}</span> : <span className="text-sm text-slate-400">{t("hotelDetail.noReviews")}</span>}</div><h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{hotel.name}</h1><div className="mt-3 flex items-start gap-2 text-sm text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{hotel.address}, {hotel.city}, {hotel.country}</span></div></div>
          <Button className="h-11 shrink-0 rounded-xl px-6 font-bold text-white" onClick={() => document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" })}>{t("hotelDetail.viewRooms")}<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </header>

        <Gallery images={images} hotelName={hotel.name} onOpen={openGallery} t={t} />

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[1fr_330px]">
          <main className="space-y-7">
            <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary"><Building2 className="h-5 w-5" /></div><h2 className="text-xl font-black text-slate-900">{t("hotelDetail.aboutHotel")}</h2></div><p className="whitespace-pre-line text-sm leading-7 text-slate-600">{hotel.description || t("hotelDetail.noDesc")}</p></section>

            {hotel.amenities?.length ? <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-900">{t("hotelDetail.amenities")}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{hotel.amenities.map((amenity) => <div key={amenity} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{formatAmenity(amenity)}</div>)}</div></section> : null}

            <section id="rooms-section" className="scroll-mt-24"><div className="mb-5"><div className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{t("hotelDetail.stayOptions")}</div><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{t("hotelDetail.chooseRoom")}</h2><p className="mt-2 text-sm text-slate-500">{t("hotelDetail.priceNote")}</p></div>{roomTypes.length ? <div className="space-y-4">{roomTypes.map((roomType) => <RoomTypeCard key={roomType.id} roomType={roomType} nights={nights} rooms={rooms} availableRooms={availabilityMap[roomType.id]} onBook={handleBookNow} t={t} lang={i18n.language} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center"><BedDouble className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-800">{t("hotelDetail.noRoomsTitle")}</h3><p className="mt-1 text-sm text-slate-500">{t("hotelDetail.noRoomsDesc")}</p></div>}</section>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[22px] border border-blue-100 bg-white shadow-sm"><div className="bg-[#05285d] p-5 text-white"><div className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">{t("hotelDetail.yourStay")}</div><div className="mt-2 text-lg font-black">{nights} {t("hotelDetail.nights")} · {rooms} {t("hotelDetail.roomsCount")}</div></div><div className="space-y-4 p-5"><DateRow label={t("hotelDetail.checkIn")} date={checkIn} lang={i18n.language} /><DateRow label={t("hotelDetail.checkOut")} date={checkOut} lang={i18n.language} /><div className="border-t border-slate-100 pt-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Users className="h-4 w-4 text-primary" />{adults + children} {t("hotelDetail.guestsCount")}</div><div className="mt-1 text-xs text-slate-500">{adults} {t("hotelDetail.adults")}{children ? `, ${children} ${t("hotelDetail.children")}` : ""}</div></div><Button variant="outline" className="w-full rounded-xl" asChild><Link to={`/search?${searchParams.toString()}`}>{t("hotelDetail.changeSearch")}</Link></Button></div></div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">{t("hotelDetail.hotelInfo")}</h3><div className="mt-4 space-y-3 text-sm"><InfoRow icon={Clock3} label={t("hotelDetail.checkIn")} value={hotel.checkInTime || t("hotelDetail.notUpdated")} /><InfoRow icon={Clock3} label={t("hotelDetail.checkOut")} value={hotel.checkOutTime || t("hotelDetail.notUpdated")} /><InfoRow icon={Phone} label={t("hotelDetail.phone")} value={hotel.phone || t("hotelDetail.notUpdated")} /><InfoRow icon={Mail} label={t("hotelDetail.email")} value={hotel.email || t("hotelDetail.notUpdated")} /></div></div>
          </aside>
        </div>
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}><DialogContent className="max-w-5xl border-0 bg-slate-950 p-0 text-white"><DialogTitle className="sr-only">{t("hotelDetail.gallery")} {hotel.name}</DialogTitle><button type="button" onClick={() => setGalleryOpen(false)} className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><X className="h-4 w-4" /></button><div className="relative flex min-h-[65vh] items-center justify-center"><img src={images[activeImage]} alt={`${hotel.name} ${activeImage + 1}`} className="max-h-[75vh] w-full object-contain" />{images.length > 1 && <><button type="button" aria-label={t("hotelDetail.prevImg")} onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 hover:bg-black/70"><ArrowLeft className="h-5 w-5" /></button><button type="button" aria-label={t("hotelDetail.nextImg")} onClick={() => setActiveImage((activeImage + 1) % images.length)} className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 hover:bg-black/70"><ArrowRight className="h-5 w-5" /></button></>}</div><div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs">{activeImage + 1} / {images.length}</div></DialogContent></Dialog>
    </div>
  );
}

function Gallery({ images, hotelName, onOpen, t }: { images: string[]; hotelName: string; onOpen: (index: number) => void; t: any }) {
  return <div className="relative grid h-[330px] grid-cols-2 gap-2 overflow-hidden rounded-[22px] sm:h-[430px] lg:grid-cols-4 lg:grid-rows-2"><button type="button" onClick={() => onOpen(0)} className="group relative col-span-2 row-span-2 overflow-hidden bg-slate-200"><img src={images[0]} alt={hotelName} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" /></button>{[1, 2, 3, 4].map((index) => <button key={index} type="button" onClick={() => onOpen(index % images.length)} className="group relative hidden overflow-hidden bg-slate-200 lg:block"><img src={images[index % images.length]} alt={`${hotelName} ${index + 1}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />{index === 4 && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-sm font-bold text-white"><Expand className="mr-2 h-4 w-4" />{t("hotelDetail.viewAllPhotos", { count: images.length })}</div>}</button>)}<button type="button" onClick={() => onOpen(0)} className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-bold text-slate-800 shadow-lg backdrop-blur lg:hidden"><Expand className="h-4 w-4" />{t("hotelDetail.viewPhotos")}</button></div>;
}

function RoomTypeCard({ roomType, nights, rooms, availableRooms, onBook, t, lang }: { roomType: RoomType; nights: number; rooms: number; availableRooms?: number; onBook: (roomType: RoomType, qty: number) => void; t: any; lang: string }) {
  const maxAvailable = availableRooms !== undefined ? Math.max(0, availableRooms) : 10;
  // Giới hạn max là 10 (OTA style) nhưng không vượt quá số phòng trống. Nếu người dùng chọn 3 phòng ban đầu, nó sẽ cố gắng chọn 3 (hoặc số phòng trống tối đa hiện tại).
  const dropdownMax = Math.min(maxAvailable, 10);
  const validInitialRooms = Math.min(rooms, dropdownMax > 0 ? dropdownMax : 1);
  const [selectedRooms, setSelectedRooms] = useState(validInitialRooms);

  // Cập nhật selectedRooms khi dropdownMax thay đổi (nếu có fetch data)
  useEffect(() => {
    if (dropdownMax > 0 && selectedRooms > dropdownMax) {
      setSelectedRooms(dropdownMax);
    }
  }, [dropdownMax]);

  const image = roomType.thumbnail || roomType.images?.[0]?.imageUrl;
  return (
    <article className="grid overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md md:grid-cols-[190px_1fr_210px]">
      {image ? (
        <img src={image} alt={roomType.name} className="h-48 w-full object-cover md:h-full" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-400 md:h-full">
          <ImageOff className="h-8 w-8" />
        </div>
      )}
      <div className="min-w-0 p-5">
        <h3 className="text-lg font-black text-slate-900">{roomType.name}</h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />{t("hotelDetail.maxGuests", { count: roomType.maxGuests })}
          </span>
          {roomType.area && (
            <span className="flex items-center gap-1.5">
              <Home className="h-4 w-4 text-primary" />{roomType.area} m²
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-primary" />{roomType.bedCount} {getBedLabels(t)[roomType.bedType] || roomType.bedType}
          </span>
        </div>
        {roomType.description && (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">{roomType.description}</p>
        )}
        {roomType.amenities?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {roomType.amenities.slice(0, 4).map((amenity) => (
              <span key={amenity} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {formatAmenity(amenity)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col justify-between border-t border-slate-100 bg-slate-50/70 p-5 md:border-l md:border-t-0">
        <div className="text-right">
          <div className="text-xs text-slate-500">{t("hotelDetail.perRoomPerNight")}</div>
          <div className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(roomType.price, lang)}</div>
          <div className="mt-2 text-xs text-slate-400">
            {t("hotelDetail.expectedPrice", { price: formatCurrency(Number(roomType.price) * nights * selectedRooms, lang), nights })}
          </div>
        </div>
        
        {availableRooms !== undefined && maxAvailable <= 5 && maxAvailable > 0 && (
          <div className="mt-3 text-right text-xs font-bold text-red-500">
            {t("hotelDetail.onlyRoomsLeft", { count: maxAvailable })}
          </div>
        )}
        
        {maxAvailable === 0 && availableRooms !== undefined && (
          <div className="mt-3 text-right text-xs font-bold text-red-500">
            {t("hotelDetail.soldOut")}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{t("hotelDetail.quantity")}</span>
          <select 
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:border-primary disabled:opacity-50"
            value={selectedRooms}
            onChange={(e) => setSelectedRooms(Number(e.target.value))}
            disabled={maxAvailable === 0}
          >
            {maxAvailable === 0 ? (
              <option value={0}>{t("hotelDetail.zeroRoom")}</option>
            ) : (
              Array.from({ length: dropdownMax }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{t("hotelDetail.nRooms", { count: num })}</option>
              ))
            )}
          </select>
        </div>
        <Button 
          className="mt-4 w-full rounded-xl font-bold text-white" 
          disabled={maxAvailable === 0}
          onClick={() => onBook(roomType, selectedRooms)}
        >
          {t("hotelDetail.selectRoomBtn")}<ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

function DateRow({ label, date, lang }: { label: string; date: Date; lang: string }) {
  return <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-primary"><CalendarDays className="h-4 w-4" /></div><div><div className="text-xs text-slate-400">{label}</div><div className="text-sm font-bold text-slate-800">{formatDate(date, lang)}</div></div></div>;
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return <div className="flex items-start gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><div className="text-xs text-slate-400">{label}</div><div className="mt-0.5 break-all font-medium text-slate-700">{value}</div></div></div>;
}

function getHotelImages(hotel: Hotel) {
  const images = [hotel.thumbnail, ...(hotel.images || []).map((image) => image.imageUrl)].filter((image): image is string => Boolean(image));
  return images.length ? [...new Set(images)] : fallbackImages;
}

function parseDate(value: string | null, daysFromToday: number) {
  if (value) {
    // If it doesn't contain a time part, append T00:00:00 to force parsing as local time
    const dateStr = value.includes("T") ? value : `${value}T00:00:00`;
    const date = new Date(dateStr);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const fallback = new Date();
  fallback.setHours(0, 0, 0, 0);
  fallback.setDate(fallback.getDate() + daysFromToday);
  return fallback;
}

function formatDate(date: Date, lang: string) {
  return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatCurrency(value: number, lang: string) {
  return new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value));
}

function formatAmenity(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}
