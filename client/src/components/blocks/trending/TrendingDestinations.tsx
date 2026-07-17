import DestinationCard from "./DestinationCard";
import { data } from "./data";
import { Plane, Globe2, Compass } from "lucide-react";

const TrendingDestinations = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Decorative Icons */}
      <div className="absolute top-20 -left-12 text-slate-200 -z-10 rotate-12 opacity-80">
        <Plane size={300} />
      </div>
      <div className="absolute top-60 -right-20 text-slate-200 -z-10 -rotate-12 opacity-80">
        <Globe2 size={400} />
      </div>
      <div className="absolute bottom-10 left-1/4 text-slate-200 -z-10 rotate-45 opacity-60">
        <Compass size={150} />
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Điểm đến thịnh hành</h2>
          <p className="text-gray-500 mt-2">
            Du khách tìm kiếm Việt Nam cũng đã đặt những nơi này
          </p>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {data.slice(0, 2).map((item) => (
            <DestinationCard key={item.id} {...item} />
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-6">
          {data.slice(2).map((item) => (
            <DestinationCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingDestinations;
