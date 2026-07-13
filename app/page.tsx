import Link from "next/link";
import { Aperture, Wand2, Layers, ShieldCheck, Zap } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { BeforeAfterHero } from "@/components/BeforeAfterHero";

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen grain">
      {/* Nav */}
      <nav className="border-b border-line/60">
        <div className="container mx-auto max-w-6xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Aperture className="text-ink" size={20} strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">ShelfShot AI</span>
          </div>
          <Link
            href={user ? "/dashboard" : "/login"}
            className="text-sm font-semibold bg-white/5 hover:bg-white/10 border border-line rounded-full px-5 py-2.5 transition-colors"
          >
            {user ? "لوحة التحكم" : "تسجيل الدخول"}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="container mx-auto max-w-6xl px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-amber-400 font-semibold text-sm tracking-widest mb-4">
              استوديو تصوير منتجات بالذكاء الاصطناعي
            </p>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-[1.15] mb-6">
              صورة منتج عادية على طاولة المطبخ،
              <br />
              <span className="text-amber-400">تخرج بجودة استوديو احترافي</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
              ارفع صورة منتجك، اكتب وصف المشهد اللي تتخيله، ودع Gemini يصنع لك لقطة تسويقية سينمائية جاهزة للنشر — بلوغو مدمج وإضاءة استوديو، خلال ثوانٍ.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-500 to-orange-600 text-ink font-bold px-7 py-3.5 rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-shadow"
              >
                <Wand2 size={18} strokeWidth={2.5} />
                جرّب مجاناً الآن
              </Link>
              <span className="text-sm text-white/40">بدون بطاقة ائتمان — 3 صور مجانية شهرياً</span>
            </div>
          </div>

          <BeforeAfterHero />
        </div>
      </header>

      {/* Features */}
      <section className="border-t border-line/60 py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-display font-bold text-2xl mb-10">ليش ShelfShot AI؟</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Wand2, title: "من فكرة إلى صورة", desc: "اكتب وصف المشهد بالعربي أو الإنجليزي، والذكاء الاصطناعي يبنيه حول منتجك فعلياً." },
              { icon: Layers, title: "دمج اللوغو تلقائياً", desc: "ارفع لوغو علامتك التجارية ليظهر بشكل طبيعي على المنتج أو بجانبه." },
              { icon: ShieldCheck, title: "مفتاحك محمي دائماً", desc: "التوليد يتم بالكامل على الخادم — لا أحد يقدر يوصل لمفتاح الـ API من المتصفح." },
            ].map((f, i) => (
              <div key={i} className="bg-panel border border-line rounded-xl2 p-6">
                <f.icon className="text-amber-400 mb-4" size={26} />
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-line/60 py-20" id="pricing">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-display font-bold text-2xl mb-2">خطط واضحة، بدون مفاجآت</h2>
          <p className="text-white/50 mb-10">غيّر أو ألغِ اشتراكك في أي وقت.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(PLANS).map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl2 p-7 border ${
                  plan.id === "pro" ? "border-amber-500/60 bg-panel2 relative" : "border-line bg-panel"
                }`}
              >
                {plan.id === "pro" && (
                  <span className="absolute -top-3 right-6 bg-amber-500 text-ink text-xs font-bold px-3 py-1 rounded-full">
                    الأكثر طلباً
                  </span>
                )}
                <h3 className="font-bold text-lg mb-1">{plan.nameAr}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-display font-extrabold">
                    {plan.price === 0 ? "مجاني" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-white/40 text-sm">/ شهرياً</span>}
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.featuresAr.map((f, i) => (
                    <li key={i} className="text-sm text-white/60 flex items-center gap-2">
                      <Zap size={14} className="text-amber-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className={`block text-center font-semibold rounded-full py-2.5 text-sm transition-colors ${
                    plan.id === "pro"
                      ? "bg-amber-500 text-ink hover:bg-amber-400"
                      : "bg-white/5 border border-line hover:bg-white/10"
                  }`}
                >
                  {plan.price === 0 ? "ابدأ مجاناً" : "اشترك الآن"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line/60 py-10">
        <div className="container mx-auto max-w-6xl px-6 text-sm text-white/30 flex items-center justify-between">
          <span>© {new Date().getFullYear()} ShelfShot AI</span>
          <span>مدعوم بواسطة Gemini</span>
        </div>
      </footer>
    </div>
  );
}
