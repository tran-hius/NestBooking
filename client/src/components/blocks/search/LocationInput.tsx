import { destinationService, Destination } from "@/api/services/destinationService";
import { useClickOutside } from "@/hooks/useClickOutside";
import { LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
}

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function LocationInput({
  value,
  onChange,
  onSubmit,
  className = "",
  inputClassName = "",
  iconClassName = "text-muted-foreground",
}: LocationInputProps) {
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  useEffect(() => {
    destinationService
      .getAllDestinations()
      .then((response) => setDestinations(response.data.filter((destination) => destination.isActive)))
      .catch((error) => console.error("Failed to load locations:", error))
      .finally(() => setIsLoading(false));
  }, []);

  const normalizedQuery = normalizeText(value.trim());
  const suggestions = destinations
    .filter((destination) => !normalizedQuery || normalizeText(destination.name).includes(normalizedQuery))
    .slice(0, 8);

  return (
    <div ref={containerRef} className={`relative flex w-full items-center gap-3 ${className}`}>
      <MapPin className={`h-5 w-5 shrink-0 ${iconClassName}`} />
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            setIsOpen(false);
            onSubmit?.();
          }
          if (event.key === "Escape") setIsOpen(false);
        }}
        aria-label={t("heroSearch.destinationLabel")}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        placeholder={t("heroSearch.destinationPlaceholder")}
        className={`w-full bg-transparent outline-none ${inputClassName}`}
      />
      {isLoading && <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-slate-400" />}

      {isOpen && !isLoading && (
        <div className="absolute left-0 top-full z-[70] mt-2 max-h-80 w-full min-w-[280px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("heroSearch.destinationsHeader")}
          </p>
          {suggestions.length > 0 ? suggestions.map((destination) => (
            <button
              type="button"
              key={destination.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(destination.name);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-primary/10"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="block font-semibold text-slate-800">{destination.name}</span>
                <span className="block text-xs text-slate-500">{destination.description || destination.country}</span>
              </span>
            </button>
          )) : (
            <p className="px-3 py-4 text-sm text-slate-500">
              {t("heroSearch.noDestinationsFound")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
