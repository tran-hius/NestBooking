import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Headset, MapPin, User, UserPlus, Home, LogOut, Heart, CalendarRange, UserCircle, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const clearAuth = useAppStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth(); 
    navigate('/login'); 
  };

  // Xác định xem có phải trang chủ không
  const isHome = location.pathname === '/';

  // Các class CSS thay đổi linh hoạt tùy theo trang
  const headerWrapperClass = isHome 
    ? "absolute top-0 left-0 right-0 z-50 w-full pt-4" 
    : "sticky top-0 z-50 w-full bg-white border-b border-slate-200 py-3 shadow-sm";
    
  const logoTextClass = isHome ? "text-white drop-shadow-md" : "text-primary";
  const iconBgClass = isHome ? "bg-white text-primary" : "bg-primary text-white";
  const linkClass = isHome ? "text-white hover:text-white/90 drop-shadow-md" : "text-slate-700 hover:text-primary";
  const authDropdownBtnClass = isHome 
    ? "bg-black/20 border border-white/20 text-white hover:bg-black/40" 
    : "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100";
  const loginBtnClass = isHome 
    ? "text-white hover:bg-white/20 hover:text-white drop-shadow-md" 
    : "text-slate-700 hover:bg-slate-100";

  return (
    <header className={headerWrapperClass}>
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${iconBgClass}`}>
            <MapPin className="h-6 w-6" />
          </div>
          <span className={`text-3xl font-black tracking-tighter ${logoTextClass}`}>
            NestBooking
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/support" className={`hidden md:flex items-center gap-2 text-base font-bold transition-colors ${linkClass}`}>
            <Headset className="h-5 w-5" />
            <span>Hỗ trợ 24/7</span>
          </Link>

          <Link to="/partner/register" className={`hidden md:flex items-center gap-2 text-base font-bold transition-colors ${linkClass}`}>
            <Home className="h-5 w-5" />
            <span>Đăng ký đối tác</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              // KHI ĐÃ ĐĂNG NHẬP: Hiện Dropdown Menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center gap-2 px-2 py-1 h-auto rounded-full backdrop-blur-md focus:ring-0 ${authDropdownBtnClass}`}>
                    <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-bold overflow-hidden border border-slate-200">
                      {user?.profile?.avatarUrl ? (
                        <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : user?.email ? (
                        user.email.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-bold text-sm max-w-[120px] truncate mr-2">
                      {user?.profile?.fullName || user?.email?.split('@')[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-slate-100 shadow-lg bg-white">
                  <DropdownMenuLabel className="font-bold text-slate-800">Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === "AGENT" && (
                    <DropdownMenuItem onClick={() => navigate('/partner/dashboard')} className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold py-2.5">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Kênh đối tác</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/settings/personal-details')} className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium py-2.5">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium py-2.5">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Yêu thích</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-bookings')} className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium py-2.5">
                    <CalendarRange className="mr-2 h-4 w-4" />
                    <span>Chuyến đi & Booking</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 font-bold py-2.5">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // KHI CHƯA ĐĂNG NHẬP: Hiện Nút Đăng nhập & Đăng ký
              <>
                <Link to="/login">
                  <Button variant="ghost" className={`hidden md:flex gap-2 text-base font-bold rounded-full px-6 ${loginBtnClass}`}>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}