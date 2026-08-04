import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function Newsletter() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-20 bg-white">
      <div className="container mx-auto">
        <div className="bg-primary rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

          <div className="relative z-10 md:w-1/2 text-white text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("newsletter.title")}</h2>
            <p className="text-white/80 text-lg">
              {t("newsletter.description")}
            </p>
          </div>

          <div className="relative z-10 w-full md:w-5/12 bg-white rounded-2xl p-2 shadow-lg flex items-center">
            <div className="pl-4 pr-2 text-slate-400">
              <Mail className="w-6 h-6" />
            </div>
            <input 
              type="email" 
              placeholder={t("newsletter.placeholder")} 
              className="flex-1 bg-transparent py-4 px-2 outline-none text-slate-700 font-medium placeholder:font-normal"
            />
            <Button className="h-12 px-6 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md font-bold">
              {t("newsletter.subscribe")}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
