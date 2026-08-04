import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building,
  Building2,
  CarFront,
  Check,
  HeartHandshake,
  Home,
  House,
  Palmtree,
  Ship,
  Sparkles,
  Tent,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyType } from "@/types";

interface PropertyOption {
  id: PropertyType;
  name: string;
  icon: LucideIcon;
  description: string;
  hint: string;
}

const propertyTypes: PropertyOption[] = [
  { id: "HOTEL", name: "Khách sạn", icon: Building2, description: "Nhiều phòng riêng, có quầy lễ tân hoặc dịch vụ lưu trú tập trung.", hint: "Phù hợp khách sạn 1-5 sao" },
  { id: "RESORT", name: "Khu nghỉ dưỡng", icon: Palmtree, description: "Không gian nghỉ dưỡng với tiện ích và dịch vụ trong cùng khuôn viên.", hint: "Biển, núi hoặc ngoại ô" },
  { id: "VILLA", name: "Biệt thự", icon: Home, description: "Không gian riêng tư, thường có nhiều phòng ngủ cho gia đình hoặc nhóm.", hint: "Cho thuê nguyên căn hoặc theo phòng" },
  { id: "APARTMENT", name: "Căn hộ", icon: Building, description: "Căn hộ có khu sinh hoạt, bếp và tiện nghi phù hợp kỳ lưu trú dài.", hint: "Căn hộ dịch vụ hoặc chung cư" },
  { id: "HOMESTAY", name: "Homestay", icon: HeartHandshake, description: "Không gian gần gũi, mang trải nghiệm bản địa và phong cách của chủ nhà.", hint: "Quy mô nhỏ và thân thiện" },
  { id: "GUESTHOUSE", name: "Nhà khách", icon: BedDouble, description: "Chỗ nghỉ quy mô vừa hoặc nhỏ với dịch vụ lưu trú cơ bản.", hint: "Chi phí hợp lý" },
  { id: "MOTEL", name: "Motel", icon: CarFront, description: "Điểm dừng chân thuận tiện, phù hợp khách đi đường hoặc lưu trú ngắn.", hint: "Dễ tiếp cận bằng phương tiện" },
  { id: "CAMPING", name: "Khu cắm trại", icon: Tent, description: "Khu vực lưu trú ngoài trời, gần thiên nhiên và hoạt động trải nghiệm.", hint: "Lều hoặc khu cắm trại" },
  { id: "GLAMPING", name: "Glamping", icon: Sparkles, description: "Trải nghiệm cắm trại kết hợp không gian và tiện nghi cao cấp.", hint: "Thiên nhiên nhưng đầy đủ tiện nghi" },
  { id: "CRUISE", name: "Du thuyền", icon: Ship, description: "Lưu trú trên mặt nước, thường kết hợp hành trình và dịch vụ trên tàu.", hint: "Vịnh, sông hoặc biển" },
  { id: "ENTIRE_HOUSE", name: "Nhà nguyên căn", icon: House, description: "Khách sử dụng toàn bộ ngôi nhà trong suốt thời gian lưu trú.", hint: "Riêng tư cho gia đình và nhóm" },
];

export default function PropertyTypeSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PropertyType | null>(null);
  const selectedProperty = propertyTypes.find((property) => property.id === selected);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" asChild className="-ml-3 rounded-xl text-slate-600 dark:text-zinc-300"><Link to="/partner/hotels"><ArrowLeft className="mr-1.5 h-4 w-4" />Quay lại chỗ nghỉ</Link></Button>
        <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white">1</span><span className="text-sky-700 dark:text-cyan-400">Loại hình</span><span className="h-px w-8 bg-slate-200 dark:bg-zinc-700" /><span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">2</span><span>Thông tin</span></div>
      </div>

      <section className="relative overflow-hidden rounded-[28px] bg-[#051f46] px-6 py-8 text-white shadow-[0_18px_50px_rgba(6,58,85,0.2)] md:px-9 md:py-10">
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-sky-100"><Building2 className="h-4 w-4" />Bước 1 trong 2</div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Bạn đang muốn đăng loại chỗ nghỉ nào?</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-cyan-50/80 md:text-base">Chọn loại hình mô tả đúng nhất cơ sở của bạn. Thông tin này giúp khách hiểu rõ trải nghiệm lưu trú và có thể thay đổi ở bước tiếp theo.</p></div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {propertyTypes.map((property) => {
            const Icon = property.icon;
            const isSelected = selected === property.id;
            return <button key={property.id} type="button" onClick={() => setSelected(property.id)} aria-pressed={isSelected} className={`group relative min-h-52 rounded-2xl border p-5 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${isSelected ? "border-sky-500 bg-sky-50 shadow-[0_12px_35px_rgba(2,132,199,0.14)] dark:bg-sky-950/25" : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-800"}`}><div className="flex items-start justify-between gap-3"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-700 dark:bg-zinc-800 dark:text-zinc-300"}`}><Icon className="h-6 w-6" /></span>{isSelected && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-white"><Check className="h-4 w-4" /></span>}</div><h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{property.name}</h2><p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{property.description}</p><div className={`mt-4 text-xs font-semibold ${isSelected ? "text-sky-700 dark:text-cyan-400" : "text-slate-400"}`}>{property.hint}</div></button>;
          })}
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Lựa chọn của bạn</div>{selectedProperty ? <div className="mt-4"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-cyan-300"><selectedProperty.icon className="h-5 w-5" /></span><div><div className="font-bold text-slate-900 dark:text-white">{selectedProperty.name}</div><div className="text-xs text-muted-foreground">{selectedProperty.hint}</div></div></div><p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">Tiếp theo bạn sẽ nhập tên, địa chỉ, liên hệ, tiện nghi và hình ảnh chỗ nghỉ.</p></div> : <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center dark:border-zinc-700 dark:bg-zinc-950"><Building2 className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-sm text-muted-foreground">Chọn một loại hình để tiếp tục.</p></div>}<Button className="mt-5 h-11 w-full rounded-xl bg-sky-600 font-bold hover:bg-sky-700" disabled={!selected} onClick={() => selected && navigate(`/partner/hotels/new?type=${selected}`)}>Tiếp tục nhập thông tin<ArrowRight className="ml-2 h-4 w-4" /></Button><p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">Chỗ nghỉ mới sẽ được gửi Admin kiểm duyệt trước khi hiển thị công khai.</p></div>
        </aside>
      </div>
    </div>
  );
}
