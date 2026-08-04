import SearchHeader from "@/components/blocks/search/SearchHeader";
import SearchResults from "@/components/blocks/search/SearchResults";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Home, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Search() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "Việt Nam";

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8fc]">
      <SearchHeader />
      <div className="container flex-1 py-7 md:py-9">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb"><Link to="/" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-white hover:text-primary"><Home className="h-3.5 w-3.5" />{t("search.home")}</Link><ChevronRight className="h-3.5 w-3.5 text-slate-300" /><span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-slate-700 shadow-sm"><MapPin className="h-3.5 w-3.5 text-primary" />{location}</span></nav>
        <SearchResults />
      </div>
    </div>
  );
}
