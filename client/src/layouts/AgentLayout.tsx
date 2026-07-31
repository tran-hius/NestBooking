import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ReactNode, useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";

import { Navigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Bell, UserCircle } from "lucide-react";
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
import { notificationService, Notification } from "@/api/services/notificationService";

export default function AgentLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, clearAuth } = useAppStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "AGENT") return;

    let isMounted = true;
    const loadNotifications = async () => {
      try {
        const response = await notificationService.getMine();
        if (isMounted) setNotifications(response.data);
      } catch (error) {
        console.error("Failed to load partner notifications:", error);
      } finally {
        if (isMounted) setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 15_000);
    window.addEventListener("focus", loadNotifications);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadNotifications);
    };
  }, [isAuthenticated, user?.role]);

  const markAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const formatNotificationTime = (createdAt: string) => new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(createdAt));

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  // Protect route
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/partner/dashboard" replace />;
  }

  // Ensure only agents can access
  if (user?.role !== "AGENT") {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AgentSidebar />
      <SidebarInset className="bg-slate-50 dark:bg-zinc-950 transition-colors">
        <header className="h-16 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-4 bg-white dark:bg-zinc-900 sticky top-0 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              NestPartner
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="hidden md:flex gap-2 text-sm border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800">
              <Link to="/">
                Về trang chủ
              </Link>
            </Button>
            
            <ModeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(380px,calc(100vw-2rem))]">
                <DropdownMenuLabel className="flex items-center justify-between gap-4">
                  <span>Thông báo {unreadCount > 0 && `(${unreadCount} mới)`}</span>
                  {unreadCount > 0 && (
                    <button type="button" onClick={markAllAsRead} className="text-xs font-medium text-primary hover:underline">
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[420px] overflow-y-auto">
                  {isLoadingNotifications ? (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">Đang tải thông báo...</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">Bạn chưa có thông báo nào.</p>
                  ) : notifications.slice(0, 8).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      asChild
                      onSelect={() => markAsRead(notification)}
                      className={`cursor-pointer p-0 ${notification.isRead ? "opacity-70" : "bg-blue-50 dark:bg-blue-950/30"}`}
                    >
                      <Link to="/partner/bookings" className="flex w-full flex-col items-start gap-1.5 px-3 py-3">
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-foreground">{notification.title}</span>
                          {!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                        </span>
                        <span className="whitespace-normal text-xs leading-relaxed text-muted-foreground">{notification.message}</span>
                        <span className="text-[11px] text-slate-400">{formatNotificationTime(notification.createdAt)}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1"></div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 outline-none hover:bg-slate-50 dark:hover:bg-zinc-800 p-1 pr-2 rounded-full transition-colors cursor-pointer">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-sm font-semibold dark:text-zinc-100">{user?.profile?.fullName || user?.profile?.firstName || "Agent"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email || "agent@nestbooking.com"}</span>
                </div>
                <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
                  <AvatarImage src={user?.profile?.avatarUrl || ""} />
                  <AvatarFallback>{user?.profile?.fullName?.charAt(0) || user?.profile?.firstName?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings/personal-details" className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
