import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS, PlanId } from "@/lib/plans";
import DashboardClient from "./DashboardClient";

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();

  const plan: PlanId = (profile?.plan as PlanId) || "free";

  const { count } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonthISO());

  const { data: history } = await supabase
    .from("generations")
    .select("id, result_url, prompt, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <DashboardClient
      email={user.email ?? ""}
      plan={plan}
      used={count ?? 0}
      limit={PLANS[plan].monthlyGenerations}
      history={history ?? []}
    />
  );
}
