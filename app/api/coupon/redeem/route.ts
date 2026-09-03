import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Redeems the single shared coupon code (env FREE_STARTER_COUPON_CODE) for
// one free month of the "starter" plan, once per user. Reuses the same
// pattern as app/api/cancel-subscription: writes go through the admin
// client because profiles has no client-side UPDATE policy (see
// supabase/schema.sql). subscription_status is set to "coupon" (not
// "cancelled") so the existing cancelled-subscription UI/copy in
// DashboardClient doesn't misfire for coupon users — but it's added to the
// downgrade-expired cron's status list so it still auto-reverts to free
// after current_period_end, same mechanism as a real cancellation.

const COUPON_CODE = process.env.FREE_STARTER_COUPON_CODE;

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({ code: null }));

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!COUPON_CODE) {
    console.error("coupon/redeem: FREE_STARTER_COUPON_CODE not set");
    return NextResponse.json({ error: "الكوبونات غير مفعّلة حالياً" }, { status: 500 });
  }

  if (typeof code !== "string" || code.trim().toUpperCase() !== COUPON_CODE.toUpperCase()) {
    return NextResponse.json({ error: "كود الكوبون غير صحيح" }, { status: 400 });
  }

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("coupon_redeemed")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (profile?.coupon_redeemed) {
    return NextResponse.json(
      { error: "استخدمتِ هذا الكوبون من قبل — كل مستخدم يقدر يستخدمه مرة وحدة." },
      { status: 400 }
    );
  }

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("profiles")
    .update({
      plan: "starter",
      subscription_status: "coupon",
      current_period_end: periodEnd.toISOString(),
      coupon_redeemed: true,
    })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, current_period_end: periodEnd.toISOString() });
}
