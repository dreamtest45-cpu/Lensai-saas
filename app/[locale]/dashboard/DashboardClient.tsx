"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Wand2, LogOut, Crown } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/ImageUploader";
import { ResultDisplay } from "@/components/ResultDisplay";
import { SubscribeButton } from "@/components/SubscribeButton";
import { ManageSubscriptionModal } from "@/components/ManageSubscriptionModal";
import { ImageAsset } from "@/types";
import { PLANS, PlanId } from "@/lib/plans";

interface HistoryItem {
  id: string;
  result_url: string | null;
  prompt: string;
  created_at: string;
}

interface Props {
  email: string;
  plan: PlanId;
  used: number;
  limit: number;
  history: HistoryItem[];
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
}

export default function DashboardClient({
  email,
  plan,
  used,
  limit,
  history,
  subscriptionStatus,
  currentPeriodEnd,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("dashboard");
  const tPlans = useTranslations("plans");
  const locale = useLocale();

  const [productImage, setProductImage] = useState<ImageAsset | null>(null);
  const [logoImage, setLogoImage] = useState<ImageAsset | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(limit - used, 0);
  const usagePct = Math.min((used / limit) * 100, 100);
  const planName = tPlans(`${plan}.name`);

  const handleGenerate = async () => {
    if (!productImage) return setError(t("errNoProduct"));
    if (!prompt.trim()) return setError(t("errNoPrompt"));

    setError(null);
    setIsGenerating(true);
    setResultImage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productBase64: productImage.base64.split(",")[1],
          productMimeType: productImage.mimeType,
          logoBase64: logoImage ? logoImage.base64.split(",")[1] : undefined,
          logoMimeType: logoImage?.mimeType,
          prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("errGenerate"));
      setResultImage(data.url);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-panel border-b border-line sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-3">
            <img src="/icon.png" alt="ShelfShot AI" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-display font-bold">ShelfShot AI</h1>
              <p className="text-xs text-white/40">{email}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Crown size={14} />
              {t("planLabel", { plan: planName })}
            </span>
            <button onClick={handleSignOut} className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/5" title={t("signOut")}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {subscriptionStatus === "cancelled" && currentPeriodEnd && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm rounded-xl2 px-5 py-3 mb-6">
            {t("cancelledNotice", {
              plan: planName,
              date: new Date(currentPeriodEnd).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            })}
          </div>
        )}

        {/* Usage bar */}
        <div className="bg-panel border border-line rounded-xl2 p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[220px]">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">{t("usageLabel")}</span>
              <span className="font-semibold">{used} / {limit}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${usagePct >= 100 ? "bg-red-500" : "bg-amber-500"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(PLANS) as PlanId[])
              .filter((id) => id !== "free" && PLANS[id].monthlyGenerations > limit)
              .map((id) => (
                <div key={id} className="w-40">
                  <p className="text-center text-xs text-white/50 mb-1">
                    {tPlans(`${id}.name`)} — ${PLANS[id].price}
                  </p>
                  <SubscribeButton planId={id} />
                </div>
              ))}
            {plan !== "free" && subscriptionStatus !== "cancelled" && (
              <ManageSubscriptionModal planName={planName} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-panel p-6 rounded-xl2 border border-line">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs text-ink font-bold">1</span>
                {t("step1Title")}
              </h2>
              <div className="space-y-4">
                <ImageUploader id="product-upload" label={t("productLabel")} image={productImage} onImageChange={setProductImage} required isLogo={false} />
                <ImageUploader id="logo-upload" label={t("logoLabel")} image={logoImage} onImageChange={setLogoImage} isLogo />
              </div>
            </div>

            <div className="bg-panel p-6 rounded-xl2 border border-line">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs text-ink font-bold">2</span>
                {t("step2Title")}
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t("promptPlaceholder")}
                className="w-full h-32 bg-ink border border-line rounded-xl p-4 text-sm outline-none focus:border-amber-500 transition-colors resize-none placeholder-white/25"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !productImage || !prompt || remaining <= 0}
                className={`w-full mt-4 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  isGenerating || !productImage || !prompt || remaining <= 0
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-gradient-to-l from-amber-500 to-orange-600 text-ink hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                    {t("generating")}
                  </>
                ) : remaining <= 0 ? (
                  t("limitReached")
                ) : (
                  <>
                    <Wand2 size={20} />
                    {t("generateBtn")}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ResultDisplay isLoading={isGenerating} generatedImageUrl={resultImage} error={error} />

            {history.length > 0 && (
              <>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => h.result_url && setResultImage(h.result_url)}
                      className="aspect-square rounded-xl overflow-hidden bg-panel border border-line/50 hover:border-amber-500/50 transition-colors"
                    >
                      {h.result_url && <img src={h.result_url} alt={h.prompt} className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>
                <p className="text-center text-white/30 mt-2 text-sm">{t("historyLabel")}</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
