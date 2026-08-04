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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BedDouble,
  CalendarCheck2,
  ChevronRight,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuGroups = [
  {
    label: "Điều hành",
    items: [
      { title: "Tổng quan", description: "Trung tâm vận hành", url: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Tài khoản",
    items: [
      { title: "Người dùng", description: "Khách hàng hệ thống", url: "/admin/users", icon: UsersRound },
      { title: "Duyệt đối tác", description: "Hồ sơ kinh doanh", url: "/admin/agents", icon: UserRoundCheck },
    ],
  },
  {
    label: "Kinh doanh",
    items: [
      { title: "Chỗ nghỉ", description: "Kiểm duyệt nội dung", url: "/admin/hotels", icon: BedDouble },
      { title: "Đặt phòng", description: "Booking toàn hệ thống", url: "/admin/bookings", icon: CalendarCheck2 },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { title: "Điểm đến", description: "Danh mục khám phá", url: "/admin/destinations", icon: MapPinned },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "none"} className="h-svh shrink-0 border-r-0 bg-[#051f46] text-white">
      <SidebarHeader className="h-[72px] justify-center border-b border-white/10 bg-[#051f46] px-3 group-data-[collapsible=icon]:px-2">
        <Link to="/admin/dashboard" onClick={closeMobile} className="flex min-w-0 items-center gap-3 rounded-xl px-1 text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-300 group-data-[collapsible=icon]:justify-center">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-950/40 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:rounded-lg">
            <span className="text-lg font-black tracking-tighter text-white">N</span>
            <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full border border-blue-600 bg-cyan-400" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block text-[17px] font-bold tracking-tight">NestBooking</span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/70">Admin console</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 overflow-hidden bg-[#051f46] px-2 py-4 group-data-[collapsible=icon]:px-1.5">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-1 py-1.5 group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/50">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        size="lg"
                        className="relative h-[52px] rounded-xl px-3 text-blue-100/80 transition-all hover:bg-white/10 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500 data-[active=true]:to-cyan-500 data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-950/30 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10"
                      >
                        <Link to={item.url} onClick={closeMobile}>
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? "bg-white/15 text-white" : "bg-white/5 text-blue-200"}`}><item.icon className="h-[18px] w-[18px]" /></span>
                          <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                            <span className="block truncate text-sm leading-tight">{item.title}</span>
                            <span className={`mt-0.5 block truncate text-[10px] font-normal ${active ? "text-blue-100" : "text-blue-200/50"}`}>{item.description}</span>
                          </span>
                          <ChevronRight className={`h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden ${active ? "text-white/80" : "text-blue-200/30"}`} />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 bg-[#051f46] p-3 group-data-[collapsible=icon]:p-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-1">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:rounded-lg">
              <ShieldCheck className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#082653] bg-cyan-400" />
            </span>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block text-xs font-semibold text-white">Hệ thống ổn định</span>
              <span className="mt-0.5 block text-[10px] text-blue-200/55">Toàn quyền quản trị</span>
            </span>
          </div>
        </div>
        <div className="px-2 pb-0.5 pt-1 text-center text-[9px] uppercase tracking-[0.16em] text-blue-200/35 group-data-[collapsible=icon]:hidden">NestBooking v1.0</div>
      </SidebarFooter>
      <SidebarRail className="hover:after:bg-cyan-400/70" />
    </Sidebar>
  );
}
