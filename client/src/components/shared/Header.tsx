import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Headset, MapPin, User, UserPlus } from 'lucide-react';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full pt-4">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-lg">
            <MapPin className="h-6 w-6" />
          </div>
          <span className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
            NestBooking
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/support" className="hidden md:flex items-center gap-2 text-base font-bold text-white hover:text-white/90 transition-colors drop-shadow-md">
            <Headset className="h-5 w-5" />
            <span>Hỗ trợ 24/7</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hidden md:flex gap-2 text-base font-bold text-white hover:bg-white/20 hover:text-white rounded-full px-6 drop-shadow-md">
                <User className="h-5 w-5" />
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg gap-2 text-base font-bold rounded-full px-6 transition-all hover:-translate-y-0.5">
                <UserPlus className="h-5 w-5" />
                Đăng ký
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
