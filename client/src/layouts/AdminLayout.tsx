import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ReactNode } from "react";
import { useAppStore } from "@/stores/useAppStore";

import { Navigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { clearAuth, user, isAuthenticated } = useAppStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/admin/login";
  };

  // Protect route
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Ensure only admins can access
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

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
