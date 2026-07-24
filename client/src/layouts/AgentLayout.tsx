import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ReactNode } from "react";
import { useAppStore } from "@/stores/useAppStore";

import { Navigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Bell, LayoutDashboard, UserCircle } from "lucide-react";
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

export default function AgentLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, clearAuth } = useAppStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  // Protect route
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer text-muted-foreground">
                  <span className="font-medium text-sm text-foreground">Chào mừng bạn đến với Kênh đối tác</span>
                  <span className="text-xs">Bắt đầu thêm chỗ nghỉ đầu tiên của bạn ngay!</span>
                </DropdownMenuItem>
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
