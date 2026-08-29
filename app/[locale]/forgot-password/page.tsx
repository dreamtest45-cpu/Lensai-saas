"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 grain">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/icon.png" alt="ShelfShot AI" className="w-11 h-11" />
          <span className="font-display font-bold text-2xl">ShelfShot AI</span>
        </div>

        <div className="bg-panel border border-line rounded-xl2 p-7">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-emerald-400 font-semibold">{t("sentTitle")}</p>
              <p className="text-sm text-white/50 leading-relaxed">
                {t("sentBody", { email })}
              </p>
              <Link href="/login" className="inline-block text-sm text-amber-400 hover:text-amber-300 mt-2">
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold mb-1">{t("title")}</h1>
              <p className="text-sm text-white/50 mb-6">
                {t("subtitle")}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="email"
                    required
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-ink border border-line rounded-xl py-3 pr-11 pl-4 text-sm outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-l from-amber-500 to-orange-600 text-ink font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {t("sendBtn")}
                </button>
              </form>
              <Link
                href="/login"
                className="mt-5 flex items-center justify-center gap-1 text-sm text-white/40 hover:text-white/70"
              >
                <ArrowRight size={14} />
                {t("backToLogin")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
