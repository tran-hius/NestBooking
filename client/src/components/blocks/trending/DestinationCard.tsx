import { AspectRatio } from "@/components/ui/aspect-ratio";
import VietNamFlag from "@/assets/vietnam-removebg-preview.png";

interface DestinationCardProps {
  url: string;
  alt: string;
  location: string;
}

const DestinationCard = ({ url, alt, location }: DestinationCardProps) => {
  return (
    <div className="overflow-hidden rounded-xl">
      <AspectRatio ratio={16 / 10}>
        <div className="relative w-full h-full group cursor-pointer">
          <img
            src={url}
            alt={alt}
            className="w-full h-full object-cover transition duration-300 "
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Content */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-2xl font-bold text-white drop-shadow-md">
              {location}
            </span>

            <img src={VietNamFlag} alt="Vietnam" className="w-11 h-11" />
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};

export default DestinationCard;
