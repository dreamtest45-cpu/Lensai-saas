"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Aperture, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations("resetPassword");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t("errorShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Aperture className="text-ink" size={22} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl">ShelfShot AI</span>
        </div>

        <div className="bg-panel border border-line rounded-xl2 p-7">
          {!ready && !success && (
            <div className="text-center py-6 space-y-3">
              <Loader2 className="animate-spin mx-auto text-amber-400" size={24} />
              <p className="text-sm text-white/50">{t("verifying")}</p>
            </div>
          )}

          {ready && !success && (
            <>
              <h1 className="text-lg font-bold mb-1">{t("title")}</h1>
              <p className="text-sm text-white/50 mb-6">{t("subtitle")}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder={t("newPasswordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-ink border border-line rounded-xl py-3 pr-11 pl-4 text-sm outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder={t("confirmPasswordPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {t("saveBtn")}
                </button>
              </form>
            </>
          )}

          {success && (
            <div className="text-center py-6 space-y-2">
              <p className="text-emerald-400 font-semibold">{t("successTitle")}</p>
              <p className="text-sm text-white/50">{t("successBody")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
