import { Star, MapPin } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";

interface HotelCardProps {
  hotel: {
    id: string | number;
    name: string;
    location: string;
    rating: number;
    price: number | null;
    imageUrl: string;
    badge?: string;
  };
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')} VNĐ`;
  };

  const handleClick = () => {
    navigate(`/hotel/${hotel.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="snap-start shrink-0 w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="relative w-full overflow-hidden">
        <AspectRatio ratio={4 / 3}>
          <img 
            src={hotel.imageUrl} 
            alt={hotel.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </AspectRatio>
        
        {hotel.badge && (
          <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {hotel.badge}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {hotel.name}
        </h3>
        
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1 opacity-70" />
          <span className="truncate">{hotel.location}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {hotel.rating > 0 ? (
            <>
              <div className="flex items-center text-primary">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold ml-1 text-sm">{hotel.rating}</span>
              </div>
              <span className="text-gray-500 ml-2">Điểm đánh giá</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Chưa có đánh giá</span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
          <span className="text-sm font-medium text-slate-500">Giá từ</span>
          <div className="flex flex-col items-end">
            <span className="text-lg font-black text-primary">
              {hotel.price === null ? "Liên hệ" : formatCurrency(hotel.price)}
            </span>
            {hotel.price !== null && <span className="text-xs text-slate-400">/ phòng / đêm</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
