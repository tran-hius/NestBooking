import {
  Sidebar,
  SidebarContent,
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
  Hotel,
  CalendarCheck,
  CreditCard,
  MessageSquare
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuGroups = [
  {
    label: "Tổng quan",
    items: [
      { title: "Dashboard", url: "/partner/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Quản lý kinh doanh",
    items: [
      { title: "Chỗ nghỉ của tôi", url: "/partner/hotels", icon: Hotel },
      { title: "Lịch đặt phòng", url: "/partner/bookings", icon: CalendarCheck },
      { title: "Doanh thu & Thanh toán", url: "/partner/payments", icon: CreditCard },
      { title: "Đánh giá của khách", url: "/partner/reviews", icon: MessageSquare },
    ],
  },
];

export function AgentSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="none" className="sticky top-0 h-screen border-r border-border">
      <SidebarHeader className="h-16 flex items-center border-b px-4">
        <Link to="/partner/dashboard" className="flex items-center gap-2 font-semibold text-lg text-primary">
          <LayoutDashboard className="h-6 w-6" />
          <span>NestPartner</span>
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
