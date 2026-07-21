import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Hotel,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Activity
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuGroups = [
  {
    label: "Tổng quan",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Tài khoản",
    items: [
      { title: "Người dùng", url: "/admin/users", icon: Users },
      { title: "Duyệt Đối tác", url: "/admin/agents", icon: UserCheck },
    ],
  },
  {
    label: "Vận hành Kinh doanh",
    items: [
      { title: "Khách sạn", url: "/admin/hotels", icon: Hotel },
      { title: "Đặt phòng (Booking)", url: "/admin/bookings", icon: CalendarCheck },
      { title: "Thanh toán", url: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    label: "Kiểm duyệt & Hỗ trợ",
    items: [
      { title: "Đánh giá (Review)", url: "/admin/reviews", icon: MessageSquare },
      { title: "Báo cáo/Khiếu nại", url: "/admin/reports", icon: AlertTriangle },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { title: "Nhật ký (Audit Log)", url: "/admin/audit", icon: Activity },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="none" className="sticky top-0 h-screen border-r border-border">
      <SidebarHeader className="h-16 flex items-center border-b px-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg text-primary">
          <LayoutDashboard className="h-6 w-6" />
          <span>NestAdmin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto hide-scrollbar">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url || location.pathname.startsWith(item.url + "/")}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
