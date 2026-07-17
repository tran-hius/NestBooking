import HeroSearch from '@/components/blocks/home/HeroSearch';
import TrendingDestinations from '@/components/blocks/trending/TrendingDestinations';
import PopularHotels from '@/components/blocks/popular-hotels/PopularHotels';
import WhyChooseUs from '@/components/blocks/home/WhyChooseUs';
import Reviews from '@/components/blocks/home/Reviews';
import Newsletter from '@/components/blocks/home/Newsletter';
import ExploreVietnam from '@/components/blocks/home/ExploreVietnam';

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <HeroSearch />
      <ExploreVietnam />
      <TrendingDestinations />
      <PopularHotels />
      <WhyChooseUs />
      <Reviews />
      <Newsletter />
    </div>
  );
}
