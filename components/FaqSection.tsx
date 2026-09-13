import { FAQ_ITEMS_AR, FAQ_ITEMS_EN } from "@/lib/faq-data";

export function FaqSection({ locale }: { locale: string }) {
  const items = locale === "en" ? FAQ_ITEMS_EN : FAQ_ITEMS_AR;
  const title = locale === "en" ? "Frequently Asked Questions" : "الأسئلة الشائعة";
  const subtitle =
    locale === "en"
      ? "Everything you need to know about ShelfShot AI"
      : "كل اللي بدك تعرفه عن ShelfShot AI";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="border-t border-line/60 py-20" id="faq">
      <div className="container mx-auto max-w-6xl px-6">
        <h2 className="font-display font-bold text-2xl mb-2">{title}</h2>
        <p className="text-white/50 mb-10">{subtitle}</p>
        <div className="max-w-3xl space-y-4">
          {items.map((item, i) => (
            <details key={i} className="bg-panel border border-line rounded-xl2 p-6 group">
              <summary className="font-bold cursor-pointer list-none flex items-center justify-between gap-4">
                {item.question}
                <span className="text-amber-400 shrink-0 text-xl leading-none group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-white/50 text-sm leading-relaxed mt-4">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
