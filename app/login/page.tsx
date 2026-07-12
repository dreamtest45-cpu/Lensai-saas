"use client";

import { useState } from "react";
import { Aperture, Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد التسجيل.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
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
          <div className="flex gap-2 mb-6 bg-ink/50 rounded-full p-1">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 text-sm font-semibold py-2 rounded-full transition-colors ${
                mode === "signin" ? "bg-amber-500 text-ink" : "text-white/50"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 text-sm font-semibold py-2 rounded-full transition-colors ${
                mode === "signup" ? "bg-amber-500 text-ink" : "text-white/50"
              }`}
            >
              حساب جديد
            </button>
          </div>

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
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink border border-line rounded-xl py-3 pr-11 pl-4 text-sm outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-emerald-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-l from-amber-500 to-orange-600 text-ink font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {mode === "signin" ? "دخول" : "إنشاء حساب"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
