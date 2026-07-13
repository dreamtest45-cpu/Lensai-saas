export type PlanId = "free" | "starter" | "economic" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  nameAr: string;
  monthlyGenerations: number;
  price: number; // USD / month, 0 for free
  priceId?: string; // Stripe price id, set via env at runtime
  featuresAr: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    nameAr: "مجاني",
    monthlyGenerations: 3,
    price: 0,
    featuresAr: [
      "3 صور شهرياً",
      "دمج لوغو أساسي",
      "دقة قياسية",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    nameAr: "بداية",
    monthlyGenerations: 20,
    price: 6,
    featuresAr: [
      "20 صورة شهرياً",
      "دمج لوغو أساسي",
      "دقة قياسية",
    ],
  },
  economic: {
    id: "economic",
    name: "Economic",
    nameAr: "اقتصادي",
    monthlyGenerations: 50,
    price: 15,
    featuresAr: [
      "50 صورة شهرياً",
      "دمج لوغو متقدم",
      "أولوية بالمعالجة",
      "دعم عبر البريد",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    nameAr: "احترافي",
    monthlyGenerations: 150,
    price: 39,
    featuresAr: [
      "150 صورة شهرياً",
      "استخدام تجاري كامل",
      "دعم مباشر ذو أولوية",
      "سجل توليد غير محدود",
    ],
  },
};

// Stripe price IDs are injected from env vars (public, since Checkout needs them client-side)
export function getPriceId(plan: "starter" | "economic" | "pro"): string {
  const map: Record<string, string | undefined> = {
    starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    economic: process.env.NEXT_PUBLIC_STRIPE_PRICE_ECONOMIC,
    pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  };
  const id = map[plan];
  if (!id) throw new Error(`Missing Stripe price id for plan: ${plan}`);
  return id;
}

export function planFromPriceId(priceId: string | null | undefined): PlanId {
  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER) return "starter";
  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ECONOMIC) return "economic";
  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return "pro";
  return "free";
}
