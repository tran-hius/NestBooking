import { ReactNode, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  BedDouble,
  CalendarCheck,
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Map,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAppStore } from "@/stores/useAppStore";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminPages = [
  { label: "Tổng quan", description: "Dashboard vận hành", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Người dùng", description: "Tài khoản khách hàng", path: "/admin/users", icon: Users },
  { label: "Đối tác", description: "Kiểm duyệt tài khoản kinh doanh", path: "/admin/agents", icon: UserCheck },
  { label: "Chỗ nghỉ", description: "Kiểm duyệt và quản lý hotel", path: "/admin/hotels", icon: BedDouble },
  { label: "Booking", description: "Đặt phòng toàn hệ thống", path: "/admin/bookings", icon: CalendarCheck },
  { label: "Điểm đến", description: "Nội dung hiển thị trang chủ", path: "/admin/destinations", icon: Map },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { clearAuth, user, isAuthenticated } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useClickOutside(searchRef, () => setIsSearchOpen(false));

  const currentPage = adminPages.find((page) => page.path === location.pathname) || adminPages[0];
  const searchResults = adminPages.filter((page) => `${page.label} ${page.description}`.toLowerCase().includes(search.trim().toLowerCase()));

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/admin/login";
  };

  const openPage = (path: string) => {
    navigate(path);
    setSearch("");
    setIsSearchOpen(false);
  };

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return (
    <SidebarProvider defaultOpen={true} className="h-svh min-h-0 overflow-hidden">
      <AdminSidebar />
      <SidebarInset className="h-svh w-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f4f7fb] transition-colors dark:bg-zinc-950">
        <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center border-b border-slate-200/80 bg-white/95 px-3 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 sm:px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
            <SidebarTrigger className="shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 md:hidden dark:border-zinc-700 dark:bg-zinc-900" />

            <div className="hidden min-w-0 lg:block">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <span>Quản trị</span><span>/</span><span className="text-slate-600 dark:text-zinc-300">{currentPage.label}</span>
              </div>
              <div className="mt-0.5 truncate text-base font-bold text-slate-900 dark:text-white">{currentPage.description}</div>
            </div>

            <div ref={searchRef} className="relative ml-0 w-full max-w-md lg:ml-auto">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(event) => { setSearch(event.target.value); setIsSearchOpen(true); }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchResults[0]) openPage(searchResults[0].path);
                  if (event.key === "Escape") setIsSearchOpen(false);
                }}
                placeholder="Tìm nhanh trang quản trị..."
                aria-label="Tìm trang quản trị"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-14 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-blue-900/30"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:block">Enter</span>
              {isSearchOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.14)] dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Điều hướng nhanh</div>
                  {searchResults.length ? searchResults.map((page) => (
                    <button key={page.path} type="button" onClick={() => openPage(page.path)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-blue-50 dark:hover:bg-zinc-800">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"><page.icon className="h-4 w-4" /></span>
                      <span className="min-w-0"><span className="block text-sm font-semibold text-slate-800 dark:text-zinc-100">{page.label}</span><span className="block truncate text-xs text-slate-500">{page.description}</span></span>
                    </button>
                  )) : <div className="px-3 py-7 text-center text-sm text-slate-500">Không tìm thấy trang phù hợp.</div>}
                </div>
              )}
            </div>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <div className="hidden items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 xl:flex">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" /></span>
              Hệ thống hoạt động
            </div>

            <ModeToggle />
            <Button variant="outline" size="sm" asChild className="hidden h-10 gap-2 rounded-xl md:flex"><Link to="/">Website<ExternalLink className="h-4 w-4" /></Link></Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 outline-none transition hover:border-slate-200 hover:bg-slate-50 data-[state=open]:border-slate-200 data-[state=open]:bg-slate-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:data-[state=open]:border-zinc-700 dark:data-[state=open]:bg-zinc-800">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200 dark:border-zinc-900 dark:ring-zinc-700">
                    <AvatarImage src={user?.profile?.avatarUrl || ""} />
                    <AvatarFallback className="bg-[#0b4b91] font-bold text-white">{user?.profile?.fullName?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden max-w-32 text-left xl:block"><div className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.profile?.fullName || "Administrator"}</div><div className="truncate text-[11px] text-slate-500">Quản trị hệ thống</div></div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 xl:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-xl">
                <DropdownMenuLabel className="px-3 py-2.5"><div className="font-semibold text-slate-900 dark:text-white">{user?.profile?.fullName || "Administrator"}</div><div className="mt-0.5 truncate text-xs font-normal text-muted-foreground">{user?.email || "admin@nestbooking.com"}</div></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2.5 md:hidden"><Link to="/"><ExternalLink className="mr-2 h-4 w-4" />Xem website</Link></DropdownMenuItem>
                <DropdownMenuItem className="cursor-default rounded-lg px-3 py-2.5"><ShieldCheck className="mr-2 h-4 w-4 text-blue-600" /><span><span className="block">Quyền truy cập</span><span className="block text-[11px] text-muted-foreground">Toàn quyền quản trị</span></span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700"><LogOut className="mr-2 h-4 w-4" />Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
