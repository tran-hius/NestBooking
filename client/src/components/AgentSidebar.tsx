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
  useSidebar,
} from "@/components/ui/sidebar";
import { BedDouble, CalendarCheck2, ChevronRight, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuGroups = [
  {
    label: "Điều hành",
    items: [
      { title: "Tổng quan", description: "Hiệu suất kinh doanh", url: "/partner/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Vận hành",
    items: [
      { title: "Chỗ nghỉ", description: "Khách sạn, phòng và giá", url: "/partner/hotels", icon: BedDouble },
      { title: "Đặt phòng", description: "Lịch lưu trú của khách", url: "/partner/bookings", icon: CalendarCheck2 },
    ],
  },
];

export function AgentSidebar() {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "none"} className="h-svh shrink-0 border-r-0 bg-[#051f46] text-white">
      <SidebarHeader className="h-[72px] justify-center border-b border-white/10 bg-[#051f46] px-3">
        <Link to="/partner/dashboard" onClick={closeMobile} className="flex min-w-0 items-center gap-3 rounded-xl px-1 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-blue-950/40"><span className="text-lg font-black">N</span><span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full border border-cyan-600 bg-white" /></span>
          <span className="min-w-0"><span className="block text-[17px] font-bold tracking-tight">NestBooking</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">Partner console</span></span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 overflow-hidden bg-[#051f46] px-2 py-4">
        {menuGroups.map((group) => <SidebarGroup key={group.label} className="px-1 py-1.5"><SidebarGroupLabel className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/50">{group.label}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu className="gap-1.5">{group.items.map((item) => { const active = location.pathname === item.url || location.pathname.startsWith(`${item.url}/`); return <SidebarMenuItem key={item.url}><SidebarMenuButton asChild isActive={active} size="lg" className="relative h-[52px] rounded-xl px-3 text-blue-100/80 transition-all hover:bg-white/10 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-500 data-[active=true]:to-cyan-500 data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-950/30"><Link to={item.url} onClick={closeMobile}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white/15 text-white" : "bg-white/5 text-blue-200"}`}><item.icon className="h-[18px] w-[18px]" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm leading-tight">{item.title}</span><span className={`mt-0.5 block truncate text-[10px] font-normal ${active ? "text-emerald-50" : "text-blue-200/50"}`}>{item.description}</span></span><ChevronRight className={`h-4 w-4 shrink-0 ${active ? "text-white/80" : "text-blue-200/30"}`} /></Link></SidebarMenuButton></SidebarMenuItem>; })}</SidebarMenu></SidebarGroupContent></SidebarGroup>)}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 bg-[#051f46] p-3"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"><div className="flex items-center gap-2.5"><span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-4 w-4" /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#082653] bg-emerald-400" /></span><span className="min-w-0"><span className="block text-xs font-semibold text-white">Kênh đối tác hoạt động</span><span className="mt-0.5 block text-[10px] text-blue-200/55">Quản lý chỗ nghỉ của bạn</span></span></div></div><div className="px-2 pt-1 text-center text-[9px] uppercase tracking-[0.16em] text-blue-200/35">NestPartner v1.0</div></SidebarFooter>
    </Sidebar>
  );
}
