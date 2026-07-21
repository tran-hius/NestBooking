import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ReactNode } from "react";
import { useAppStore } from "@/stores/useAppStore";

import { Navigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Bell } from "lucide-react";
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, clearAuth } = useAppStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/admin/login";
  };

  // Protect route (Tạm thời tắt để dev giao diện)
  // if (!isAuthenticated) {
  //   return <Navigate to="/admin/login" replace />;
  // }

  // Ensure only admins can access (Tạm thời tắt)
  // if (user?.role !== "ADMIN") {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset className="bg-slate-50 dark:bg-zinc-950 transition-colors">
        <header className="h-16 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-4 bg-white dark:bg-zinc-900 sticky top-0 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              NestAdmin
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ModeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border-2 border-white dark:border-zinc-900"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Thông báo (3 mới)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-medium text-sm">Có 1 đối tác mới đăng ký</span>
                  <span className="text-xs text-muted-foreground">Khách sạn "Boutique Hanoi" đang chờ duyệt.</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-medium text-sm">Người dùng báo cáo lỗi</span>
                  <span className="text-xs text-muted-foreground">User USR-002 vừa gửi một phản hồi.</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer text-muted-foreground">
                  <span className="font-medium text-sm text-foreground">Bảo trì hệ thống</span>
                  <span className="text-xs">Lên lịch bảo trì vào 2h sáng Chủ Nhật.</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Button variant="ghost" asChild className="w-full text-center text-sm text-blue-600 hover:text-blue-700">
                  <Link to="/admin/notifications">Xem tất cả thông báo</Link>
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1"></div>
            
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold dark:text-zinc-100">{user?.profile?.fullName || "Admin"}</span>
              <span className="text-xs text-muted-foreground">{user?.email || "admin@nestbooking.com"}</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profile?.avatarUrl || ""} />
              <AvatarFallback>{user?.profile?.fullName?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
