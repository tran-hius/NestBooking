import { Link } from "react-router-dom";
import { ArrowRight, CalendarRange, Headphones, Mail, MapPin, Search, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const getExploreLinks = (t: any) => [
  { label: t("footer.links.search"), href: "/search" },
  { label: t("footer.links.myBookings"), href: "/my-bookings" },
  { label: t("footer.links.profile"), href: "/settings/personal-details" },
];

const getPartnerLinks = (t: any) => [
  { label: t("footer.links.registerPartner"), href: "/partner/register" },
  { label: t("footer.links.partnerDashboard"), href: "/partner/dashboard" },
  { label: t("footer.links.supportCenter"), href: "/support" },
];

export default function Footer() {
  const { t } = useTranslation();
  const exploreLinks = getExploreLinks(t);
  const partnerLinks = getPartnerLinks(t);

  return (
    <footer className="relative overflow-hidden bg-[#031b3d] text-blue-100/70">
      <div className="absolute inset-0"><div className="absolute -right-32 -top-36 h-96 w-96 rounded-full border border-white/5" /><div className="absolute right-10 top-16 h-64 w-64 rounded-full bg-cyan-400/[0.05] blur-3xl" /></div>
      <div className="container relative py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
          <div><Link to="/" className="inline-flex items-center gap-2.5 text-white"><span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-950"><MapPin className="h-5 w-5" /><span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full border border-blue-600 bg-cyan-300" /></span><span className="text-2xl font-black tracking-tight">NestBooking</span></Link><p className="mt-5 max-w-sm text-sm leading-7 text-blue-100/60">{t("footer.aboutDesc")}</p><div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-sky-300/15 bg-cyan-400/[0.08] px-3 py-2 text-xs font-semibold text-sky-200"><ShieldCheck className="h-4 w-4" />{t("footer.vnpayVerified")}</div></div>

          <FooterColumn title={t("footer.explore")} links={exploreLinks} />
          <FooterColumn title={t("footer.partner")} links={partnerLinks} />

          <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">{t("footer.support")}</h3><p className="mt-4 text-sm leading-6 text-blue-100/55">{t("footer.supportDesc")}</p><a href="mailto:support@nestbooking.com" className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 transition hover:bg-white/[0.1]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300"><Mail className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-xs text-blue-100/45">{t("footer.supportEmail")}</span><span className="block truncate text-sm font-bold text-white">support@nestbooking.com</span></span></a></div>
        </div>

        <div className="mt-12 grid gap-3 border-y border-white/10 py-5 sm:grid-cols-3">
          <FooterFeature icon={Search} label={t("footer.feature1Title")} description={t("footer.feature1Desc")} />
          <FooterFeature icon={CalendarRange} label={t("footer.feature2Title")} description={t("footer.feature2Desc")} />
          <FooterFeature icon={Headphones} label={t("footer.feature3Title")} description={t("footer.feature3Desc")} />
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-blue-100/40 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} NestBooking. {t("footer.copyright")}</p><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><Link to="/support" className="transition hover:text-white">{t("footer.support")}</Link><Link to="/partner/register" className="transition hover:text-white">{t("footer.forPartner")}</Link><Link to="/search" className="inline-flex items-center gap-1 font-semibold text-cyan-300 transition hover:text-cyan-200">{t("footer.exploreStays")}<ArrowRight className="h-3.5 w-3.5" /></Link></div></div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">{title}</h3><ul className="mt-4 space-y-3">{links.map((link) => <li key={link.href}><Link to={link.href} className="inline-flex items-center gap-2 text-sm transition hover:translate-x-0.5 hover:text-white"><span className="h-1 w-1 rounded-full bg-cyan-400/60" />{link.label}</Link></li>)}</ul></div>;
}

function FooterFeature({ icon: Icon, label, description }: { icon: typeof Search; label: string; description: string }) {
  return <div className="flex items-center gap-3 rounded-xl px-2 py-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-cyan-300"><Icon className="h-4 w-4" /></span><span><span className="block text-sm font-bold text-white">{label}</span><span className="mt-0.5 block text-[11px] text-blue-100/45">{description}</span></span></div>;
}
