export type PlanId = "free" | "starter" | "economic" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  nameAr: string;
  monthlyGenerations: number;
  price: number; // USD / month, 0 for free
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
