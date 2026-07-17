import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Search, Users, Building2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <section className="relative w-full h-[550px] flex flex-col items-center justify-center pt-20">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/30"
          style={{ backgroundImage: "url('/images/banner.jpg')" }}
        />
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 flex flex-col items-center mt-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-10 drop-shadow-md">
            Leading travel app – one tap, endless destinations
          </h1>

          <div className="w-full max-w-5xl flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/20 text-white font-semibold backdrop-blur-md border border-white/30 hover:bg-white/30 transition">
                <Building2 className="w-5 h-5" />
                Hotels
              </button>
            </div>

            <div className="flex w-full text-white text-sm font-medium mb-2 px-2">
              <div className="w-2/5">City, destination, or hotel name</div>
              <div className="w-1/4">Check-in & Check-out Dates</div>
              <div className="w-1/4">Guests and Rooms</div>
            </div>

            <div className="w-full bg-white rounded-2xl p-2 flex flex-col md:flex-row shadow-2xl items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition rounded-xl cursor-text">
                <MapPin className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="City, hotel, place to go" 
                  className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
              
              <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

              <div className="flex-[0.7] flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition rounded-xl cursor-pointer">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="text-slate-700 font-medium whitespace-nowrap">
                  17 Jul 2026 - 18 Jul 2026
                </div>
              </div>

              <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

              <div className="flex-[0.7] flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition rounded-xl cursor-pointer">
                <Users className="w-5 h-5 text-primary" />
                <div className="text-slate-700 font-medium whitespace-nowrap">
                  2 adults, 0 children, 1 room
                </div>
              </div>

              <Button className="h-12 px-8 bg-[#ff5e1f] hover:bg-[#e04f15] text-white rounded-xl shadow-lg shadow-orange-500/30">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-12 flex flex-col items-center">
        <div className="w-full max-w-5xl h-48 bg-gradient-to-r from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-xl mt-8">
          <span className="text-2xl font-bold">Promo Banner (Du lịch chất, đón hè chill)</span>
        </div>
      </section>
    </div>
  );
}
