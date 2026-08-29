"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CreditCard, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ManageSubscriptionModalProps {
  planName: string;
}

export function ManageSubscriptionModal({ planName }: ManageSubscriptionModalProps) {
  const router = useRouter();
  const t = useTranslations("manageSubscription");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cancel-subscription", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("genericError"));
      }

      setOpen(false);
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
        <CreditCard size={14} />
        {t("manage")}
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
            <p className="text-sm text-white/60 mb-6">
              {t("bodyPrefix")} <span className="text-amber-400 font-semibold">{planName}</span>.{" "}
              {t("bodySuffix")}
            </p>

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
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 text-sm font-semibold bg-red-500/90 text-white rounded-full py-2.5 hover:bg-red-500 disabled:opacity-50"
              >
                {loading ? t("cancelling") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
