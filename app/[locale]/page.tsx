import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Wand2, Layers, ShieldCheck, Zap, CreditCard } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { ToolTutorialHero } from "@/components/ToolTutorialHero";
import { SubscribeButton } from "@/components/SubscribeButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations("home");
  const tPlans = await getTranslations("plans");
  const tNav = await getTranslations("nav");

  const features = t.raw("features") as { title: string; desc: string }[];

  return (
    <div className="min-h-screen grain">
      {/* Nav */}
      <nav className="border-b border-line/60">
        <div className="container mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/icon.png" alt="ShelfShot AI" className="w-9 h-9 sm:w-10 sm:h-10" />
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight">ShelfShot AI</span>
          </div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            <Link href="/blog" className="text-sm text-white/60 hover:text-white font-medium">
              {tNav("blog")}
            </Link>
            <LanguageSwitcher />
            <Link
              href={user ? "/dashboard" : "/login"}
              className="text-sm font-semibold bg-white/5 hover:bg-white/10 border border-line rounded-full px-5 py-2.5 transition-colors"
            >
              {user ? tNav("dashboard") : tNav("login")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="container mx-auto max-w-6xl px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-amber-400 font-semibold text-sm tracking-widest mb-4">
              {t("eyebrow")}
            </p>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-[1.15] mb-6">
              {t("titleLine1")}
              <br />
              <span className="text-amber-400">{t("titleHighlight")}</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
              {t("subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-500 to-orange-600 text-ink font-bold px-7 py-3.5 rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-shadow"
              >
                <Wand2 size={18} strokeWidth={2.5} />
                {t("ctaTry")}
              </Link>
              <span className="text-sm text-white/40">{t("ctaNote")}</span>
            </div>
          </div>

          <ToolTutorialHero />
        </div>
      </header>

      {/* Features */}
      <section className="border-t border-line/60 py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-display font-bold text-2xl mb-10">{t("featuresTitle")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[Wand2, Layers, ShieldCheck].map((Icon, i) => (
              <div key={i} className="bg-panel border border-line rounded-xl2 p-6">
                <Icon className="text-amber-400 mb-4" size={26} />
                <h3 className="font-bold mb-2">{features[i].title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{features[i].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-line/60 py-20" id="pricing">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-display font-bold text-2xl mb-2">{t("pricingTitle")}</h2>
          <p className="text-white/50 mb-10">{t("pricingSubtitle")}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(PLANS).map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl2 p-7 border ${
                  plan.id === "pro" ? "border-amber-500/60 bg-panel2 relative" : "border-line bg-panel"
                }`}
              >
                {plan.id === "pro" && (
                  <span className="absolute -top-3 right-6 bg-amber-500 text-ink text-xs font-bold px-3 py-1 rounded-full">
                    {t("mostPopular")}
                  </span>
                )}
                <h3 className="font-bold text-lg mb-1">{tPlans(`${plan.id}.name`)}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-display font-extrabold">
                    {plan.price === 0 ? t("free") : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-white/40 text-sm">{t("perMonth")}</span>}
                </div>
                <ul className="space-y-2.5 mb-7">
                  {(tPlans.raw(`${plan.id}.features`) as string[]).map((f, i) => (
                    <li key={i} className="text-sm text-white/60 flex items-center gap-2">
                      <Zap size={14} className="text-amber-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.price === 0 ? (
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    className="block text-center font-semibold rounded-full py-2.5 text-sm transition-colors bg-white/5 border border-line hover:bg-white/10"
                  >
                    {t("startFree")}
                  </Link>
                              ) : (
                  <SubscribeButton planId={plan.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

     <footer className="border-t border-line/60 py-10">
        <div className="container mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-white/30">© {new Date().getFullYear()} ShelfShot AI</span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/40">
            <Link href="/about" className="hover:text-white/70">{t("footer.about")}</Link>
            <Link href="/contact" className="hover:text-white/70">{t("footer.contact")}</Link>
            <Link href="/terms" className="hover:text-white/70">{t("footer.terms")}</Link>
            <Link href="/privacy" className="hover:text-white/70">{t("footer.privacy")}</Link>
            <Link href="/refund" className="hover:text-white/70">{t("footer.refund")}</Link>
          </div>
          <div className="flex items-center gap-3 text-white/40">
            <span className="inline-flex items-center gap-1.5 border border-line rounded-md px-2.5 py-1 text-xs font-semibold">
              <CreditCard size={14} />
              Visa
            </span>
            <span className="inline-flex items-center gap-1.5 border border-line rounded-md px-2.5 py-1 text-xs font-semibold">
              <CreditCard size={14} />
              Mastercard
            </span>
          </div>
        </div>
      </footer>
</div>
  );
}
