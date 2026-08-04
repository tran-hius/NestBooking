import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Reviews() {
  const { t } = useTranslation();

  const reviews = [
    {
      id: 1,
      name: t("reviews.r1Name"),
      role: t("reviews.r1Role"),
      content: t("reviews.r1Content"),
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      id: 2,
      name: t("reviews.r2Name"),
      role: t("reviews.r2Role"),
      content: t("reviews.r2Content"),
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      id: 3,
      name: t("reviews.r3Name"),
      role: t("reviews.r3Role"),
      content: t("reviews.r3Content"),
      rating: 4,
      avatar: "https://i.pravatar.cc/150?img=15"
    }
  ];

  return (
    <section className="w-full py-16 bg-slate-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">{t("reviews.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("reviews.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-background p-8 rounded-3xl shadow-sm border border-border hover:shadow-lg transition-shadow relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-muted-foreground rotate-180" />
              
              <div className="flex gap-1 mb-6 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < review.rating ? "fill-current" : "text-muted"}`} />
                ))}
              </div>
              
              <p className="text-slate-600 mb-8 leading-relaxed italic relative z-10">
                "{review.content}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <img 
                  src={review.avatar} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{review.name}</h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
