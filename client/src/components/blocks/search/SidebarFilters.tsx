import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export interface SidebarFiltersProps {
  nameFilter: string;
  setNameFilter: (name: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  propertyTypes: string[];
  setPropertyTypes: (types: string[] | ((prev: string[]) => string[])) => void;
}

const PROPERTY_TYPES = [
  "HOTEL",
  "RESORT",
  "VILLA",
  "APARTMENT",
  "HOMESTAY",
  "GUESTHOUSE",
  "MOTEL",
  "CAMPING",
  "GLAMPING",
  "CRUISE",
  "ENTIRE_HOUSE",
];

export default function SidebarFilters({
  nameFilter,
  setNameFilter,
  maxPrice,
  setMaxPrice,
  propertyTypes,
  setPropertyTypes
}: SidebarFiltersProps) {
  const { t } = useTranslation();
  const togglePropertyType = (value: string) => {
    setPropertyTypes((prev) => 
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search by property name */}
        <div>
          <h3 className="mb-3 font-bold text-slate-900">{t("search.searchName")}</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text"
              placeholder={t("search.searchNamePlaceholder")}
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="mb-4 font-bold text-slate-900">{t("search.budget")}</h3>
          <div className="flex flex-col gap-2">
            {[
              { value: "ALL", label: t("search.budgetAll") },
              { value: "1000000", label: `${t("search.under")} 1.000.000 VND` },
              { value: "2000000", label: `${t("search.under")} 2.000.000 VND` },
              { value: "3000000", label: `${t("search.under")} 3.000.000 VND` },
              { value: "5000000", label: `${t("search.under")} 5.000.000 VND` },
            ].map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-3 group">
                <input 
                  type="radio" 
                  name="budget"
                  checked={maxPrice === option.value}
                  onChange={() => setMaxPrice(option.value)}
                  className="h-4 w-4 cursor-pointer text-primary focus:ring-primary" 
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="mb-4 font-bold text-slate-900">{t("search.propertyType")}</h3>
          <div className="flex flex-col gap-3">
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-3 group">
                <input 
                  type="checkbox" 
                  checked={propertyTypes.includes(type)}
                  onChange={() => togglePropertyType(type)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary" 
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{t(`enums.PropertyType.${type}`)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
