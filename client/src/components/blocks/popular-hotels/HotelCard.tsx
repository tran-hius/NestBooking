import { Star, MapPin } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')} VNĐ`;
  };

  const handleClick = () => {
    navigate(`/hotel/${hotel.id}`);
  };

  const badgeText = hotel.badge 
    ? t(`enums.PropertyType.${hotel.badge}`, { defaultValue: hotel.badge })
    : null;

  return (
    <div 
      onClick={handleClick}
      className="group flex w-[82vw] shrink-0 snap-start cursor-pointer flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
    >
      <div className="relative w-full overflow-hidden">
        <AspectRatio ratio={4 / 3}>
          <img 
            src={hotel.imageUrl} 
            alt={hotel.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </AspectRatio>
        
        {badgeText && (
          <div className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md backdrop-blur">
            {badgeText}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {hotel.name}
        </h3>
        
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1 opacity-70" />
          <span className="truncate">{hotel.location}</span>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {hotel.rating > 0 ? (
            <>
              <div className="flex items-center text-primary">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold ml-1 text-sm">{hotel.rating}</span>
              </div>
              <span className="ml-1 text-sm text-gray-500">{t("popularHotels.ratingLabel")}</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">{t("popularHotels.noRating")}</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-medium text-slate-500">{t("popularHotels.priceFrom")}</span>
          <div className="flex flex-col items-end">
            <span className="text-lg font-black text-primary">
              {hotel.price === null ? t("popularHotels.contactPrice") : formatCurrency(hotel.price)}
            </span>
            {hotel.price !== null && <span className="text-xs text-slate-400">{t("popularHotels.pricePerNight")}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
