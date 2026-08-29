export type PlanId = "free" | "starter" | "economic" | "pro";

// البيانات الرقمية فقط هون — النصوص (الاسم والمزايا) صارت بملفات الترجمة
// messages/ar.json و messages/en.json تحت مفتاح "plans"
export interface Plan {
  id: PlanId;
  monthlyGenerations: number;
  price: number; // USD / month, 0 for free
}

export const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", monthlyGenerations: 3, price: 0 },
  starter: { id: "starter", monthlyGenerations: 20, price: 6 },
  economic: { id: "economic", monthlyGenerations: 50, price: 15 },
  pro: { id: "pro", monthlyGenerations: 150, price: 39 },
};
