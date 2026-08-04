import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import { Destination } from "@/api/services/destinationService";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/search?location=${encodeURIComponent(destination.name)}`);
  };

  return (
    <button 
      type="button" 
      aria-label={t("trendingDestinations.imgAriaLabel", { name: destination.name })} 
      className="group w-full overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl" 
      onClick={handleClick}
    >
      <AspectRatio ratio={16 / 10}>
        <div className="relative h-full w-full cursor-pointer">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/10 to-transparent" />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-5">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-cyan-200">
                <MapPin className="h-3.5 w-3.5" />{destination.countryFlag} {destination.country}
              </div>
              <span className="text-2xl font-black text-white drop-shadow-md">{destination.name}</span>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-white group-hover:text-primary">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </AspectRatio>
    </button>
  );
};

export default DestinationCard;
