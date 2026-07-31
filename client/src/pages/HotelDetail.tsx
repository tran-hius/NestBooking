import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Hotel, RoomType } from "@/types";
import { toast } from "sonner";

const propertyLabels: Record<string, string> = {
  HOTEL: "Khách sạn",
  RESORT: "Khu nghỉ dưỡng",
  VILLA: "Biệt thự",
  APARTMENT: "Căn hộ",
  HOMESTAY: "Homestay",
  GUESTHOUSE: "Nhà khách",
  MOTEL: "Nhà nghỉ",
  CAMPING: "Khu cắm trại",
  GLAMPING: "Glamping",
  CRUISE: "Du thuyền",
  ENTIRE_HOUSE: "Nhà nguyên căn",
};

const bedLabels: Record<string, string> = {
  SINGLE: "Giường đơn",
  DOUBLE: "Giường đôi",
  QUEEN: "Giường Queen",
  KING: "Giường King",
  TWIN: "Hai giường đơn",
  BUNK: "Giường tầng",
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1582719478250-c8940026e7ae?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85",
];

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchHotel = async () => {
      setLoading(true);
      try {
        const response = await hotelService.getHotelById(id);
        setHotel(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Không thể tải thông tin chỗ nghỉ");
      } finally {
        setLoading(false);
      }
    };
    void fetchHotel();
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-20"><div className="text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" /><p className="mt-3 text-sm text-slate-500">Đang tải thông tin chỗ nghỉ...</p></div></div>;
  if (!hotel) return <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 pt-20 text-center"><Building2 className="h-12 w-12 text-slate-300" /><h1 className="mt-4 text-2xl font-bold text-slate-800">Không tìm thấy chỗ nghỉ</h1><p className="mt-2 text-slate-500">Chỗ nghỉ có thể đã ngừng hiển thị hoặc đường dẫn không còn hợp lệ.</p><Button onClick={() => navigate("/search")} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" />Quay lại tìm kiếm</Button></div>;

  const checkIn = parseDate(searchParams.get("checkIn"), 1);
  const checkOut = parseDate(searchParams.get("checkOut"), 2);
  const adults = Number(searchParams.get("adults") || 2);
  const children = Number(searchParams.get("children") || 0);
  const rooms = Number(searchParams.get("rooms") || 1);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));
  const roomTypes = (hotel.roomTypes || []).filter((roomType) => roomType.isActive);
  const images = getHotelImages(hotel);

  const handleBookNow = (roomType: RoomType) => {
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
        rooms,
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
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb"><Link to="/" className="rounded-lg px-2 py-1 hover:bg-white hover:text-primary">Trang chủ</Link><ChevronRight className="h-3.5 w-3.5 text-slate-300" /><Link to={`/search${searchParams.size ? `?${searchParams.toString()}` : ""}`} className="rounded-lg px-2 py-1 hover:bg-white hover:text-primary">Tìm kiếm</Link><ChevronRight className="h-3.5 w-3.5 text-slate-300" /><span className="max-w-52 truncate rounded-lg bg-white px-2 py-1 text-slate-700 shadow-sm">{hotel.name}</span></nav>

        <header className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0"><div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">{propertyLabels[hotel.propertyType] || hotel.propertyType}</Badge>{hotel.rating && hotel.rating > 0 ? <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{hotel.rating.toFixed(1)}</span> : <span className="text-sm text-slate-400">Chưa có đánh giá</span>}</div><h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{hotel.name}</h1><div className="mt-3 flex items-start gap-2 text-sm text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{hotel.address}, {hotel.city}, {hotel.country}</span></div></div>
          <Button className="h-11 shrink-0 rounded-xl px-6 font-bold text-white" onClick={() => document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" })}>Xem loại phòng<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </header>

        <Gallery images={images} hotelName={hotel.name} onOpen={openGallery} />

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[1fr_330px]">
          <main className="space-y-7">
            <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary"><Building2 className="h-5 w-5" /></div><h2 className="text-xl font-black text-slate-900">Giới thiệu chỗ nghỉ</h2></div><p className="whitespace-pre-line text-sm leading-7 text-slate-600">{hotel.description || "Đối tác chưa cung cấp mô tả chi tiết cho chỗ nghỉ này."}</p></section>

            {hotel.amenities?.length ? <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-900">Tiện nghi nổi bật</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{hotel.amenities.map((amenity) => <div key={amenity} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{formatAmenity(amenity)}</div>)}</div></section> : null}

            <section id="rooms-section" className="scroll-mt-24"><div className="mb-5"><div className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Lựa chọn lưu trú</div><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Chọn loại phòng</h2><p className="mt-2 text-sm text-slate-500">Giá hiển thị theo mỗi phòng, mỗi đêm. Tổng tiền được tính ở bước tiếp theo.</p></div>{roomTypes.length ? <div className="space-y-4">{roomTypes.map((roomType) => <RoomTypeCard key={roomType.id} roomType={roomType} nights={nights} rooms={rooms} onBook={handleBookNow} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center"><BedDouble className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-800">Chưa có loại phòng đang mở bán</h3><p className="mt-1 text-sm text-slate-500">Vui lòng quay lại sau hoặc chọn chỗ nghỉ khác.</p></div>}</section>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[22px] border border-blue-100 bg-white shadow-sm"><div className="bg-[#05285d] p-5 text-white"><div className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">Kỳ lưu trú của bạn</div><div className="mt-2 text-lg font-black">{nights} đêm · {rooms} phòng</div></div><div className="space-y-4 p-5"><DateRow label="Nhận phòng" date={checkIn} /><DateRow label="Trả phòng" date={checkOut} /><div className="border-t border-slate-100 pt-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Users className="h-4 w-4 text-primary" />{adults + children} khách</div><div className="mt-1 text-xs text-slate-500">{adults} người lớn{children ? `, ${children} trẻ em` : ""}</div></div><Button variant="outline" className="w-full rounded-xl" asChild><Link to={`/search?${searchParams.toString()}`}>Thay đổi tìm kiếm</Link></Button></div></div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">Thông tin chỗ nghỉ</h3><div className="mt-4 space-y-3 text-sm"><InfoRow icon={Clock3} label="Nhận phòng" value={hotel.checkInTime || "Chưa cập nhật"} /><InfoRow icon={Clock3} label="Trả phòng" value={hotel.checkOutTime || "Chưa cập nhật"} /><InfoRow icon={Phone} label="Điện thoại" value={hotel.phone || "Chưa cập nhật"} /><InfoRow icon={Mail} label="Email" value={hotel.email || "Chưa cập nhật"} /></div></div>
          </aside>
        </div>
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}><DialogContent className="max-w-5xl border-0 bg-slate-950 p-0 text-white"><DialogTitle className="sr-only">Thư viện ảnh {hotel.name}</DialogTitle><button type="button" onClick={() => setGalleryOpen(false)} className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><X className="h-4 w-4" /></button><div className="relative flex min-h-[65vh] items-center justify-center"><img src={images[activeImage]} alt={`${hotel.name} ${activeImage + 1}`} className="max-h-[75vh] w-full object-contain" />{images.length > 1 && <><button type="button" aria-label="Ảnh trước" onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 hover:bg-black/70"><ArrowLeft className="h-5 w-5" /></button><button type="button" aria-label="Ảnh tiếp theo" onClick={() => setActiveImage((activeImage + 1) % images.length)} className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 hover:bg-black/70"><ArrowRight className="h-5 w-5" /></button></>}</div><div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs">{activeImage + 1} / {images.length}</div></DialogContent></Dialog>
    </div>
  );
}

function Gallery({ images, hotelName, onOpen }: { images: string[]; hotelName: string; onOpen: (index: number) => void }) {
  return <div className="relative grid h-[330px] grid-cols-2 gap-2 overflow-hidden rounded-[22px] sm:h-[430px] lg:grid-cols-4 lg:grid-rows-2"><button type="button" onClick={() => onOpen(0)} className="group relative col-span-2 row-span-2 overflow-hidden bg-slate-200"><img src={images[0]} alt={hotelName} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" /></button>{[1, 2, 3, 4].map((index) => <button key={index} type="button" onClick={() => onOpen(index % images.length)} className="group relative hidden overflow-hidden bg-slate-200 lg:block"><img src={images[index % images.length]} alt={`${hotelName} ${index + 1}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />{index === 4 && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-sm font-bold text-white"><Expand className="mr-2 h-4 w-4" />Xem {images.length} ảnh</div>}</button>)}<button type="button" onClick={() => onOpen(0)} className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-bold text-slate-800 shadow-lg backdrop-blur lg:hidden"><Expand className="h-4 w-4" />Xem ảnh</button></div>;
}

function RoomTypeCard({ roomType, nights, rooms, onBook }: { roomType: RoomType; nights: number; rooms: number; onBook: (roomType: RoomType) => void }) {
  const image = roomType.thumbnail || roomType.images?.[0]?.imageUrl;
  return <article className="grid overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md md:grid-cols-[190px_1fr_210px]">{image ? <img src={image} alt={roomType.name} className="h-48 w-full object-cover md:h-full" /> : <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-400 md:h-full"><ImageOff className="h-8 w-8" /></div>}<div className="min-w-0 p-5"><h3 className="text-lg font-black text-slate-900">{roomType.name}</h3><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600"><span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" />Tối đa {roomType.maxGuests} khách</span>{roomType.area && <span className="flex items-center gap-1.5"><Home className="h-4 w-4 text-primary" />{roomType.area} m²</span>}<span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-primary" />{roomType.bedCount} {bedLabels[roomType.bedType] || roomType.bedType}</span></div>{roomType.description && <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">{roomType.description}</p>}{roomType.amenities?.length ? <div className="mt-4 flex flex-wrap gap-2">{roomType.amenities.slice(0, 4).map((amenity) => <span key={amenity} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{formatAmenity(amenity)}</span>)}</div> : null}</div><div className="flex flex-col justify-between border-t border-slate-100 bg-slate-50/70 p-5 md:border-l md:border-t-0"><div className="text-right"><div className="text-xs text-slate-500">Mỗi phòng / đêm</div><div className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(roomType.price)}</div><div className="mt-2 text-xs text-slate-400">Dự kiến {formatCurrency(Number(roomType.price) * nights * rooms)} cho {nights} đêm</div></div><Button className="mt-5 w-full rounded-xl font-bold text-white" onClick={() => onBook(roomType)}>Chọn phòng<ArrowRight className="ml-2 h-4 w-4" /></Button></div></article>;
}

function DateRow({ label, date }: { label: string; date: Date }) {
  return <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-primary"><CalendarDays className="h-4 w-4" /></div><div><div className="text-xs text-slate-400">{label}</div><div className="text-sm font-bold text-slate-800">{formatDate(date)}</div></div></div>;
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
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const fallback = new Date();
  fallback.setHours(0, 0, 0, 0);
  fallback.setDate(fallback.getDate() + daysFromToday);
  return fallback;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value));
}

function formatAmenity(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}
