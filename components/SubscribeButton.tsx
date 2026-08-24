"use client";

import { useState } from "react";

interface SubscribeButtonProps {
  planId: string;
}

export function SubscribeButton({ planId }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error(data.error || "حصل خطأ، حاولي مرة ثانية");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        // Payment was authorised immediately with no redirect needed
        window.location.href = "/dashboard?payment=complete";
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full text-center font-semibold rounded-full py-2.5 text-sm transition-colors bg-white/5 border border-line hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "لحظات..." : "اشترك الآن"}
      </button>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
