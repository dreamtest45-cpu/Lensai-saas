"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Ticket, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function RedeemCouponModal() {
  const router = useRouter();
  const t = useTranslations("redeemCoupon");
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRedeem() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coupon/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("genericError"));
      }

      setOpen(false);
      setCode("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold bg-white/5 border border-line px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10"
      >
        <Ticket size={14} />
        {t("openBtn")}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-panel border border-line rounded-xl2 p-6 max-w-sm w-full relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 left-4 text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-lg mb-2">{t("title")}</h3>
            <p className="text-sm text-white/60 mb-4">{t("body")}</p>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full bg-white/5 border border-line rounded-full px-4 py-2.5 text-sm mb-4 text-center tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-amber-500/50"
            />

            {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 text-sm font-semibold bg-white/5 border border-line rounded-full py-2.5 hover:bg-white/10 disabled:opacity-50"
              >
                {t("back")}
              </button>
              <button
                onClick={handleRedeem}
                disabled={loading || !code.trim()}
                className="flex-1 text-sm font-semibold bg-amber-500 text-ink rounded-full py-2.5 hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? t("redeeming") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
