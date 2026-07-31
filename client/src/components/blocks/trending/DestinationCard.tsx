import { AspectRatio } from "@/components/ui/aspect-ratio";
import VietNamFlag from "@/assets/vietnam-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Destination } from "@/api/services/destinationService";

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
 
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/search?location=${encodeURIComponent(destination.name)}`);
  };

  return (
    <button type="button" aria-label={`Tìm chỗ nghỉ tại ${destination.name}`} className="w-full overflow-hidden rounded-xl text-left" onClick={handleClick}>
      <AspectRatio ratio={16 / 10}>
        <div className="relative w-full h-full group cursor-pointer">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover transition duration-300 "
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Content */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-2xl font-bold text-white drop-shadow-md">
              {destination.name}
            </span>

            {destination.countryFlag === "🇻🇳" ? (
              <img src={VietNamFlag} alt="Vietnam" className="w-11 h-11" />
            ) : (
              <span className="text-2xl">{destination.countryFlag}</span>
            )}
          </div>
        </div>
      </AspectRatio>
    </button>
  );
};

export default DestinationCard;
