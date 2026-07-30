import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Users, Home, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { hotelService } from "@/api/services/hotelService"; import { Hotel } from "@/types";

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchHotel = async () => {
      try {
        setIsLoading(true);
        const res = await hotelService.getHotelById(id);
        if (res?.data) {
          setHotel(res.data);
        } else {
          toast.error("Không tìm thấy thông tin khách sạn");
        }
      } catch (error) {
        console.error("Failed to fetch hotel details:", error);
        toast.error("Có lỗi xảy ra khi tải thông tin khách sạn");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#003b95]" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Khách sạn không tồn tại</h1>
        <Button onClick={() => navigate("/")} className="bg-[#003b95] hover:bg-[#002a6b]">
          Về trang chủ
        </Button>
      </div>
    );
  }

  const handleBookNow = (roomTypeId: string) => {
    const roomType = hotel.roomTypes.find((rt: any) => rt.id === roomTypeId);
    navigate("/checkout", {
      state: {
        hotelId: hotel.id,
        roomTypeId,
        hotel,
        roomType
      }
    });
  };

  const images = hotel.images?.length > 0 ? hotel.images.map((img: any) => img.imageUrl) : [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582719478250-c8940026e7ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Tiêu đề & Thông tin cơ bản */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded">
                {hotel.propertyType}
              </span>
              <div className="flex text-yellow-400">
                {[...Array(hotel.starRating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{hotel.name}</h1>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <MapPin className="w-4 h-4 mr-1" />
              {hotel.address}, {hotel.city}, {hotel.country}
            </div>
          </div>
          <Button 
            className="bg-[#003b95] hover:bg-[#002a6b] h-12 px-8 font-bold text-base"
            onClick={() => {
              document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Chọn phòng
          </Button>
        </div>

        {/* Thư viện ảnh (Grid) */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] mb-8 rounded-xl overflow-hidden">
          <div className="col-span-2 row-span-2 relative group cursor-pointer">
            <img src={images[0]} alt="Hotel Main" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
            <img src={images[1 % images.length]} alt="Hotel 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
            <img src={images[2 % images.length]} alt="Hotel 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
            <img src={images[3 % images.length]} alt="Hotel 4" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
            <img src={images[4 % images.length]} alt="Hotel 5" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Xem tất cả ảnh</span>
            </div>
          </div>
        </div>

        {/* Mô tả & Nổi bật */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Giới thiệu về khách sạn</h2>
            <div className="text-slate-700 leading-relaxed whitespace-pre-line">
              {hotel.description || "Nằm ở trung tâm thành phố, khách sạn cung cấp chỗ ở tiện nghi với đầy đủ các dịch vụ hiện đại. Du khách có thể tận hưởng không gian thư giãn và phong cách phục vụ chuyên nghiệp. Wi-Fi miễn phí được cung cấp trong toàn bộ khuôn viên."}
            </div>
          </div>
          <div className="w-full lg:w-[350px]">
            <Card className="bg-[#ebf3ff] border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Điểm nổi bật của chỗ nghỉ</h3>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#003b95]" />
                    <span>Vị trí tuyệt vời: Được đánh giá cao bởi du khách</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Hủy miễn phí cho đa số các phòng</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Không cần thẻ tín dụng khi đặt</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Danh sách phòng */}
        <div id="rooms-section" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Phòng trống</h2>
          
          {(!hotel.roomTypes || hotel.roomTypes.length === 0) ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
              Hiện tại khách sạn chưa có loại phòng nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotel.roomTypes.map((roomType) => (
                <Card key={roomType.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-slate-200">
                  <CardContent className="p-0">
                    <div className="p-5 border-b border-slate-100">
                      <h3 className="text-xl font-bold text-[#003b95] mb-2">{roomType.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {roomType.maxGuests} Khách</span>
                        <span className="flex items-center gap-1"><Home className="w-4 h-4" /> {roomType.area || 25} m²</span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                          <Check className="w-4 h-4" /> Hủy miễn phí
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                          <Check className="w-4 h-4" /> Không cần thanh toán trước
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 line-clamp-2">
                        {roomType.description || "Phòng nghỉ được thiết kế hiện đại với đầy đủ tiện nghi tiêu chuẩn, mang lại cảm giác thoải mái cho khách lưu trú."}
                      </div>
                    </div>
                    <div className="p-5 bg-slate-50 flex flex-col justify-between">
                      <div className="mb-4">
                        <div className="text-xs text-slate-500 mb-1">Giá cho 1 đêm</div>
                        <div className="text-2xl font-black text-slate-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roomType.price)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Bao gồm thuế và phí</div>
                      </div>
                      <Button 
                        className="w-full bg-[#003b95] hover:bg-[#002a6b] font-bold text-white h-11"
                        onClick={() => handleBookNow(roomType.id)}
                      >
                        Đặt ngay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
