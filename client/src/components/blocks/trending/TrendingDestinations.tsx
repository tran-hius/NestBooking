import DestinationCard from "./DestinationCard";
import { data } from "./data";

const TrendingDestinations = () => {
  return (
    <section className="container mx-auto py-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Trending destinations</h2>

        <p className="text-gray-500 mt-2">
          Travelers searching for Vietnam also booked these
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
    </section>
  );
};

export default TrendingDestinations;
