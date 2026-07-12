export type PlanId = "free" | "pro" | "business";

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
  pro: {
    id: "pro",
    name: "Pro",
    nameAr: "احترافي",
    monthlyGenerations: 150,
    price: 9,
    featuresAr: [
      "150 صورة شهرياً",
      "دمج لوغو متقدم",
      "أولوية بالمعالجة",
      "دعم عبر البريد",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    nameAr: "أعمال",
    monthlyGenerations: 1000,
    price: 29,
    featuresAr: [
      "1000 صورة شهرياً",
      "استخدام تجاري كامل",
      "دعم مباشر ذو أولوية",
      "سجل توليد غير محدود",
    ],
  },
};

// Stripe price IDs are injected from env vars (public, since Checkout needs them client-side)
export function getPriceId(plan: "pro" | "business"): string {
  const map: Record<string, string | undefined> = {
    pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    business: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
  };
  const id = map[plan];
  if (!id) throw new Error(`Missing Stripe price id for plan: ${plan}`);
  return id;
}

export function planFromPriceId(priceId: string | null | undefined): PlanId {
  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS) return "business";
  return "free";
}
