import { type ReactNode, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Bell, ChevronDown, ExternalLink, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import { notificationService, type Notification } from "@/api/services/notificationService";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ModeToggle } from "@/components/mode-toggle";
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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/stores/useAppStore";

const partnerPages = [
  { path: "/partner/dashboard", label: "Tổng quan", description: "Dashboard vận hành đối tác" },
  { path: "/partner/property-type", label: "Thêm chỗ nghỉ", description: "Thiết lập hồ sơ chỗ nghỉ mới" },
  { path: "/partner/hotels", label: "Chỗ nghỉ", description: "Quản lý chỗ nghỉ, loại phòng và phòng vật lý" },
  { path: "/partner/bookings", label: "Đặt phòng", description: "Lịch lưu trú và booking của khách" },
];

export default function AgentLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, clearAuth } = useAppStore();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const currentPage = [...partnerPages].reverse().find((page) => location.pathname === page.path || location.pathname.startsWith(`${page.path}/`)) || partnerPages[0];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "AGENT") return;
    let mounted = true;
    const loadNotifications = async () => {
      try {
        const response = await notificationService.getMine();
        if (mounted) setNotifications(response.data);
      } catch (error) {
        console.error("Failed to load partner notifications:", error);
      } finally {
        if (mounted) setLoadingNotifications(false);
      }
    };
    void loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 15_000);
    window.addEventListener("focus", loadNotifications);
    return () => { mounted = false; window.clearInterval(intervalId); window.removeEventListener("focus", loadNotifications); };
  }, [isAuthenticated, user?.role]);

  const markAsRead = async (notification: Notification) => {
    if (notification.isRead) return;
    try {
      await notificationService.markAsRead(notification.id);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  if (!isAuthenticated) return <Navigate to="/login?redirect=/partner/dashboard" replace />;
  if (user?.role !== "AGENT") return <Navigate to="/" replace />;

  return (
    <SidebarProvider defaultOpen className="h-svh min-h-0 overflow-hidden">
      <AgentSidebar />
      <SidebarInset className="h-svh w-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f4f7fb] transition-colors dark:bg-zinc-950">
        <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center border-b border-slate-200/80 bg-white/95 px-3 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 sm:px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5"><SidebarTrigger className="shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 md:hidden dark:border-zinc-700 dark:bg-zinc-900" /><div className="min-w-0"><div className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><span>Kênh đối tác</span><span>/</span><span className="text-slate-600 dark:text-zinc-300">{currentPage.label}</span></div><div className="mt-0.5 hidden truncate text-base font-bold text-slate-900 sm:block dark:text-white">{currentPage.description}</div></div></div>

          <div className="ml-3 flex shrink-0 items-center gap-1.5 sm:gap-2.5"><div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 xl:flex"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>Kênh đang hoạt động</div><ModeToggle /><Button variant="outline" size="sm" asChild className="hidden h-10 gap-2 rounded-xl md:flex"><Link to="/">Website<ExternalLink className="h-4 w-4" /></Link></Button>

            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"><Bell className="h-5 w-5" />{unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-[min(390px,calc(100vw-2rem))] rounded-2xl p-2 shadow-xl"><DropdownMenuLabel className="flex items-center justify-between gap-3 px-3 py-2"><span>Thông báo {unreadCount > 0 && `(${unreadCount} mới)`}</span>{unreadCount > 0 && <button type="button" onClick={() => void markAllAsRead()} className="text-xs font-semibold text-primary hover:underline">Đọc tất cả</button>}</DropdownMenuLabel><DropdownMenuSeparator /><div className="max-h-[420px] overflow-y-auto">{loadingNotifications ? <p className="px-3 py-10 text-center text-sm text-muted-foreground">Đang tải thông báo...</p> : notifications.length ? notifications.slice(0, 8).map((notification) => <DropdownMenuItem key={notification.id} asChild onSelect={() => void markAsRead(notification)} className={`cursor-pointer rounded-xl p-0 ${notification.isRead ? "opacity-70" : "bg-blue-50 dark:bg-blue-950/30"}`}><Link to="/partner/bookings" className="flex w-full flex-col items-start gap-1.5 px-3 py-3"><span className="flex w-full items-center justify-between gap-3"><span className="text-sm font-semibold">{notification.title}</span>{!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}</span><span className="whitespace-normal text-xs leading-relaxed text-muted-foreground">{notification.message}</span><span className="text-[11px] text-slate-400">{formatNotificationTime(notification.createdAt)}</span></Link></DropdownMenuItem>) : <p className="px-3 py-10 text-center text-sm text-muted-foreground">Bạn chưa có thông báo nào.</p>}</div></DropdownMenuContent></DropdownMenu>

            <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 outline-none transition hover:border-slate-200 hover:bg-slate-50 data-[state=open]:border-slate-200 data-[state=open]:bg-slate-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"><Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200 dark:border-zinc-900 dark:ring-zinc-700"><AvatarImage src={user?.profile?.avatarUrl || ""} /><AvatarFallback className="bg-emerald-600 font-bold text-white">{user?.profile?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}</AvatarFallback></Avatar><div className="hidden max-w-32 text-left xl:block"><div className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.profile?.fullName || "Đối tác"}</div><div className="truncate text-[11px] text-slate-500">Quản lý chỗ nghỉ</div></div><ChevronDown className="hidden h-4 w-4 text-slate-400 xl:block" /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-xl"><DropdownMenuLabel className="px-3 py-2.5"><div className="font-semibold text-slate-900 dark:text-white">{user?.profile?.fullName || "Đối tác NestBooking"}</div><div className="mt-0.5 truncate text-xs font-normal text-muted-foreground">{user?.email}</div></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2.5 md:hidden"><Link to="/"><ExternalLink className="mr-2 h-4 w-4" />Xem website</Link></DropdownMenuItem><DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2.5"><Link to="/settings/personal-details"><UserCircle className="mr-2 h-4 w-4" />Hồ sơ cá nhân</Link></DropdownMenuItem><DropdownMenuItem className="cursor-default rounded-lg px-3 py-2.5"><ShieldCheck className="mr-2 h-4 w-4 text-emerald-600" /><span><span className="block">Quyền truy cập</span><span className="block text-[11px] text-muted-foreground">Quản lý chỗ nghỉ sở hữu</span></span></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700"><LogOut className="mr-2 h-4 w-4" />Đăng xuất</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          </div>
        </header>
        <div className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function formatNotificationTime(createdAt: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(createdAt));
}
