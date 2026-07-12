"use client";

import { useState } from "react";
import Link from "next/link";
import { Aperture, Mail, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
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
      setError(err.message || "حدث خطأ، حاول مرة أخرى.");
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
          <span className="font-display font-bold text-2xl">LensAI</span>
        </div>

        <div className="bg-panel border border-line rounded-xl2 p-7">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-emerald-400 font-semibold">تم إرسال الرابط!</p>
              <p className="text-sm text-white/50 leading-relaxed">
                تحقق من بريدك الإلكتروني ({email}) واضغط على الرابط لإعادة تعيين كلمة المرور.
              </p>
              <Link href="/login" className="inline-block text-sm text-amber-400 hover:text-amber-300 mt-2">
                الرجوع لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold mb-1">نسيت كلمة المرور؟</h1>
              <p className="text-sm text-white/50 mb-6">
                أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيينها.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="بريدك الإلكتروني"
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
                  إرسال رابط إعادة التعيين
                </button>
              </form>
              <Link
                href="/login"
                className="mt-5 flex items-center justify-center gap-1 text-sm text-white/40 hover:text-white/70"
              >
                <ArrowRight size={14} />
                الرجوع لتسجيل الدخول
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
