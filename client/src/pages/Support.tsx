import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Headphones,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Support() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const topics = [
    { icon: Search, titleKey: "support.topics.searchRooms", descKey: "support.topics.searchRoomsDesc", href: "/search" },
    { icon: CalendarCheck2, titleKey: "support.topics.manageBookings", descKey: "support.topics.manageBookingsDesc", href: "/my-bookings" },
    { icon: CreditCard, titleKey: "support.topics.payment", descKey: "support.topics.paymentDesc", href: "#payments" },
    { icon: UserRound, titleKey: "support.topics.account", descKey: "support.topics.accountDesc", href: "/settings/personal-details" },
    { icon: Building2, titleKey: "support.topics.partner", descKey: "support.topics.partnerDesc", href: "/partner/register" },
  ];

  const questions = [
    { category: "booking", qKey: "support.questions.q1", aKey: "support.questions.a1" },
    { category: "booking", qKey: "support.questions.q2", aKey: "support.questions.a2" },
    { category: "booking", qKey: "support.questions.q3", aKey: "support.questions.a3" },
    { category: "payment", qKey: "support.questions.q4", aKey: "support.questions.a4" },
    { category: "payment", qKey: "support.questions.q5", aKey: "support.questions.a5" },
    { category: "account", qKey: "support.questions.q6", aKey: "support.questions.a6" },
    { category: "partner", qKey: "support.questions.q7", aKey: "support.questions.a7" },
  ];

  const [openQuestion, setOpenQuestion] = useState<string | null>(questions[0].qKey);

  const filteredQuestions = questions.filter((item) =>
    `${t(item.qKey)} ${t(item.aKey)}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f8fc] pb-20">
      <section className="relative overflow-hidden bg-[#05285d] pb-24 pt-32 text-white">
        <div className="absolute inset-0"><div className="absolute -right-28 -top-36 h-96 w-96 rounded-full border border-white/10" /><div className="absolute right-20 top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" /><div className="absolute -bottom-32 left-10 h-72 w-72 rounded-full border border-white/5" /></div>
        <div className="container relative text-center"><div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-cyan-200 backdrop-blur"><Headphones className="h-4 w-4" />{t("support.helpCenter")}</div><h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">{t("support.heroTitle")}</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100/80">{t("support.heroSubtitle")}</p><div className="relative mx-auto mt-8 max-w-2xl"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-14 rounded-2xl border-white/20 bg-white pl-12 pr-4 text-base text-slate-900 shadow-[0_20px_55px_rgba(1,15,35,0.25)] placeholder:text-slate-400" placeholder={t("support.searchPlaceholder")} /></div></div>
      </section>

      <div className="container relative -mt-12">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{topics.map((topic) => <TopicCard key={topic.titleKey} icon={topic.icon} title={t(topic.titleKey)} description={t(topic.descKey)} href={topic.href} viewGuide={t("support.viewGuide")} />)}</section>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[1fr_320px]">
          <section id="payments" className="scroll-mt-24"><div className="mb-7"><div className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{t("support.faqSection")}</div><h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{t("support.faqTitle")}</h2><p className="mt-2 text-sm text-slate-500">{t("support.faqDesc")}</p></div><div className="space-y-3">{filteredQuestions.length ? filteredQuestions.map((item) => { const open = openQuestion === item.qKey; return <article key={item.qKey} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${open ? "border-blue-200" : "border-slate-200"}`}><button type="button" className="flex w-full items-center justify-between gap-4 p-5 text-left" onClick={() => setOpenQuestion(open ? null : item.qKey)}><span className="font-bold text-slate-900">{t(item.qKey)}</span><ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180 text-primary" : ""}`} /></button>{open && <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-7 text-slate-600">{t(item.aKey)}</div>}</article>; }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center"><CircleHelp className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-800">{t("support.noResultTitle")}</h3><p className="mt-1 text-sm text-slate-500">{t("support.noResultDesc")}</p></div>}</div></section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[22px] bg-[#05285d] text-white shadow-xl"><div className="p-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300"><Mail className="h-6 w-6" /></div><h2 className="mt-5 text-xl font-black">{t("support.stillNeedHelp")}</h2><p className="mt-2 text-sm leading-relaxed text-blue-100/75">{t("support.emailInstructions")}</p><Button asChild className="mt-5 w-full rounded-xl bg-white font-bold text-[#05285d] hover:bg-blue-50"><a href="mailto:support@nestbooking.com">support@nestbooking.com<ArrowRight className="ml-2 h-4 w-4" /></a></Button></div><div className="border-t border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-blue-100/60">{t("support.doNotShare")}</div></div>
            <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm"><ShieldCheck className="h-5 w-5" /></div><div><div className="font-bold text-emerald-900">{t("support.safeSupport")}</div><div className="text-xs text-emerald-700">{t("support.safeSupportDesc")}</div></div></div><p className="mt-4 text-sm leading-relaxed text-emerald-800/80">{t("support.safetyNote")}</p></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ icon: Icon, title, description, href, viewGuide }: { icon: typeof Search; title: string; description: string; href: string; viewGuide: string }) {
  const content = <><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary transition group-hover:bg-primary group-hover:text-white"><Icon className="h-5 w-5" /></div><h2 className="mt-4 font-black text-slate-900">{title}</h2><p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">{viewGuide}<ArrowRight className="h-3.5 w-3.5" /></span></>;
  const className = "group block rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg";
  return href.startsWith("#") ? <a href={href} className={className}>{content}</a> : <Link to={href} className={className}>{content}</Link>;
}
