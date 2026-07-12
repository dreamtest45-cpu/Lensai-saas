"use client";

import React, { useState } from "react";
import { Aperture, Wand2, LogOut, CreditCard, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/ImageUploader";
import { ResultDisplay } from "@/components/ResultDisplay";
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
}

export default function DashboardClient({ email, plan, used, limit, history }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [productImage, setProductImage] = useState<ImageAsset | null>(null);
  const [logoImage, setLogoImage] = useState<ImageAsset | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  const remaining = Math.max(limit - used, 0);
  const usagePct = Math.min((used / limit) * 100, 100);

  const handleGenerate = async () => {
    if (!productImage) return setError("الرجاء رفع صورة المنتج أولاً.");
    if (!prompt.trim()) return setError("الرجاء كتابة وصف للمشهد.");

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
      if (!res.ok) throw new Error(data.error || "حدث خطأ أثناء توليد الصورة.");
      setResultImage(data.url);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgrade = async (targetPlan: "pro" | "business") => {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setBillingLoading(false);
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Aperture className="text-ink" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">LensAI</h1>
              <p className="text-xs text-white/40">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Crown size={14} />
              خطة {PLANS[plan].nameAr}
            </span>
            <button onClick={handleSignOut} className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/5" title="تسجيل الخروج">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Usage bar */}
        <div className="bg-panel border border-line rounded-xl2 p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[220px]">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">الاستخدام هذا الشهر</span>
              <span className="font-semibold">{used} / {limit}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${usagePct >= 100 ? "bg-red-500" : "bg-amber-500"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            {plan !== "business" && (
              <button
                disabled={billingLoading}
                onClick={() => handleUpgrade(plan === "free" ? "pro" : "business")}
                className="text-sm font-semibold bg-amber-500 text-ink px-4 py-2 rounded-full hover:bg-amber-400 disabled:opacity-60"
              >
                ترقية الخطة
              </button>
            )}
            {plan !== "free" && (
              <button
                disabled={billingLoading}
                onClick={handleManageBilling}
                className="text-sm font-semibold bg-white/5 border border-line px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 disabled:opacity-60"
              >
                <CreditCard size={14} />
                إدارة الاشتراك
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-panel p-6 rounded-xl2 border border-line">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs text-ink font-bold">1</span>
                المواد الأولية
              </h2>
              <div className="space-y-4">
                <ImageUploader id="product-upload" label="صورة المنتج (أساسي)" image={productImage} onImageChange={setProductImage} required />
                <ImageUploader id="logo-upload" label="اللوغو (اختياري)" image={logoImage} onImageChange={setLogoImage} />
              </div>
            </div>

            <div className="bg-panel p-6 rounded-xl2 border border-line">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs text-ink font-bold">2</span>
                وصف المشهد
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثال: زجاجة عطر على طاولة رخامية سوداء مع إضاءة سينمائية دافئة..."
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
                    جاري المعالجة...
                  </>
                ) : remaining <= 0 ? (
                  "وصلت للحد الأقصى — رقّي خطتك"
                ) : (
                  <>
                    <Wand2 size={20} />
                    توليد الصورة
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
                    <div key={h.id} className="aspect-square rounded-xl overflow-hidden bg-panel border border-line/50">
                      {h.result_url && <img src={h.result_url} alt={h.prompt} className="w-full h-full object-cover" />}
                    </div>
                  ))}
                </div>
                <p className="text-center text-white/30 mt-2 text-sm">آخر عمليات التوليد</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
