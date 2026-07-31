import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarRange,
  Headphones,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  User,
  UserCircle,
  UserPlus,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const primaryLinks = [
  { label: "Tìm chỗ nghỉ", href: "/search", icon: Search },
  { label: "Hỗ trợ", href: "/support", icon: Headphones },
];

interface HeaderUser {
  email?: string;
  role?: string;
  profile?: { fullName?: string | null; avatarUrl?: string | null } | null;
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const clearAuth = useAppStore((state) => state.clearAuth);
  const isHome = location.pathname === "/";

  const handleLogout = () => {
    clearAuth();
    setMobileOpen(false);
    navigate("/login");
  };

  const headerClass = isHome
    ? "absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-[#031b3d]/20 text-white backdrop-blur-md"
    : "sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 text-slate-800 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl";
  const subtleText = isHome ? "text-blue-100/85 hover:text-white" : "text-slate-600 hover:text-primary";

  return (
    <header className={headerClass}>
      <div className="container flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg ${isHome ? "bg-white text-primary" : "bg-gradient-to-br from-cyan-400 to-blue-600 text-white"}`}><MapPin className="h-5 w-5" /><span className={`absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ${isHome ? "bg-emerald-500" : "border border-blue-600 bg-emerald-300"}`} /></span>
          <span className="truncate text-xl font-black tracking-tight sm:text-2xl">NestBooking</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
          {primaryLinks.map((item) => {
            const active = location.pathname === item.href;
            return <Link key={item.href} to={item.href} className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${active ? isHome ? "bg-white/15 text-white" : "bg-blue-50 text-primary" : subtleText}`}><item.icon className="h-4 w-4" />{item.label}</Link>;
          })}
          <Link to="/partner/register" className={`ml-1 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${subtleText}`}><Building2 className="h-4 w-4" />Đăng chỗ nghỉ</Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          {isAuthenticated ? <AccountMenu isHome={isHome} user={user} onNavigate={navigate} onLogout={handleLogout} /> : <div className="hidden items-center gap-2 sm:flex"><Button variant="ghost" asChild className={`rounded-xl font-semibold ${isHome ? "text-white hover:bg-white/10 hover:text-white" : "text-slate-700"}`}><Link to="/login"><User className="mr-1.5 h-4 w-4" />Đăng nhập</Link></Button><Button asChild className="rounded-xl px-5 font-bold text-white shadow-lg shadow-blue-500/15"><Link to="/register">Đăng ký</Link></Button></div>}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Mở menu" className={`rounded-xl lg:hidden ${isHome ? "text-white hover:bg-white/10 hover:text-white" : "text-slate-700"}`}><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-[min(88vw,360px)] border-l-0 bg-[#05285d] p-0 text-white">
              <SheetHeader className="border-b border-white/10 p-5 text-left"><SheetTitle className="flex items-center gap-2.5 text-white"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary"><MapPin className="h-5 w-5" /></span>NestBooking</SheetTitle><SheetDescription className="text-blue-100/60">Điều hướng nhanh trên thiết bị di động.</SheetDescription></SheetHeader>
              <div className="flex h-[calc(100%-105px)] flex-col overflow-y-auto p-4">
                <nav className="space-y-2">{primaryLinks.map((item) => <MobileLink key={item.href} href={item.href} icon={item.icon} label={item.label} active={location.pathname === item.href} />)}<MobileLink href="/partner/register" icon={Building2} label="Đăng ký chỗ nghỉ" active={location.pathname === "/partner/register"} />{isAuthenticated && <><MobileLink href="/my-bookings" icon={CalendarRange} label="Chuyến đi & Booking" active={location.pathname === "/my-bookings"} /><MobileLink href="/settings/personal-details" icon={UserCircle} label="Hồ sơ cá nhân" active={location.pathname === "/settings/personal-details"} />{user?.role === "AGENT" && <MobileLink href="/partner/dashboard" icon={LayoutDashboard} label="Kênh đối tác" active={location.pathname.startsWith("/partner/")} />}</>}</nav>
                <div className="mt-auto border-t border-white/10 pt-4">{isAuthenticated ? <div className="space-y-3"><div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3"><UserAvatar user={user} /><div className="min-w-0"><div className="truncate text-sm font-bold">{user?.profile?.fullName || "Tài khoản NestBooking"}</div><div className="truncate text-xs text-blue-100/55">{user?.email}</div></div></div><Button variant="outline" onClick={handleLogout} className="w-full rounded-xl border-red-300/20 bg-red-400/10 text-red-200 hover:bg-red-400/20 hover:text-white"><LogOut className="mr-2 h-4 w-4" />Đăng xuất</Button></div> : <div className="grid gap-2"><SheetClose asChild><Button variant="outline" asChild className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link to="/login"><User className="mr-2 h-4 w-4" />Đăng nhập</Link></Button></SheetClose><SheetClose asChild><Button asChild className="rounded-xl bg-white font-bold text-[#05285d] hover:bg-blue-50"><Link to="/register"><UserPlus className="mr-2 h-4 w-4" />Tạo tài khoản</Link></Button></SheetClose></div>}</div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function AccountMenu({ isHome, user, onNavigate, onLogout }: { isHome: boolean; user: HeaderUser | null; onNavigate: (path: string) => void; onLogout: () => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className={`hidden items-center gap-2 rounded-xl border p-1.5 outline-none transition sm:flex ${isHome ? "border-white/15 bg-white/10 text-white hover:bg-white/15" : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"}`}><UserAvatar user={user} /><span className="hidden max-w-28 truncate text-sm font-bold md:block">{user?.profile?.fullName || user?.email?.split("@")[0] || "Tài khoản"}</span></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="mt-2 w-64 rounded-2xl p-2 shadow-xl"><DropdownMenuLabel className="px-3 py-2"><div className="font-bold text-slate-900">{user?.profile?.fullName || "Tài khoản NestBooking"}</div><div className="mt-0.5 truncate text-xs font-normal text-slate-500">{user?.email}</div></DropdownMenuLabel><DropdownMenuSeparator />{user?.role === "AGENT" && <DropdownMenuItem onClick={() => onNavigate("/partner/dashboard")} className="cursor-pointer rounded-xl py-2.5 font-semibold text-blue-700"><LayoutDashboard className="mr-2 h-4 w-4" />Kênh đối tác</DropdownMenuItem>}<DropdownMenuItem onClick={() => onNavigate("/my-bookings")} className="cursor-pointer rounded-xl py-2.5"><CalendarRange className="mr-2 h-4 w-4" />Chuyến đi & Booking</DropdownMenuItem><DropdownMenuItem onClick={() => onNavigate("/settings/personal-details")} className="cursor-pointer rounded-xl py-2.5"><UserCircle className="mr-2 h-4 w-4" />Hồ sơ cá nhân</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-xl py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700"><LogOut className="mr-2 h-4 w-4" />Đăng xuất</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}

function UserAvatar({ user }: { user: HeaderUser | null }) {
  return <Avatar className="h-9 w-9 border border-white/20"><AvatarImage src={user?.profile?.avatarUrl || ""} /><AvatarFallback className="bg-white font-bold text-primary">{user?.profile?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback></Avatar>;
}

function MobileLink({ href, icon: Icon, label, active }: { href: string; icon: typeof Search; label: string; active: boolean }) {
  return <SheetClose asChild><Link to={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-white text-[#05285d]" : "text-blue-100/80 hover:bg-white/10 hover:text-white"}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-blue-50 text-primary" : "bg-white/[0.07] text-cyan-300"}`}><Icon className="h-4 w-4" /></span>{label}</Link></SheetClose>;
}
