import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Cancels the current user's subscription WITHOUT immediately downgrading
// them — they keep their paid plan's access until `current_period_end`
// (the date already paid for), matching how most subscription products
// behave. A separate scheduled job (app/api/cron/downgrade-expired) sweeps
// daily and actually moves expired, cancelled accounts back to the free
// plan once their period ends. See that route + vercel.json for the cron
// wiring.

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!profile || profile.plan === "free") {
    return NextResponse.json({ error: "لا يوجد اشتراك فعّال لإلغائه" }, { status: 400 });
  }

  if (profile.subscription_status === "cancelled") {
    return NextResponse.json(
      { error: "الاشتراك ملغى بالفعل، وراح يرجع تلقائياً لخطة مجاني بنهاية الفترة الحالية." },
      { status: 400 }
    );
  }

  // Written via the admin (service-role) client, not the cookie-based user
  // client: supabase/schema.sql intentionally grants no client-side UPDATE
  // policy on profiles, so plan/subscription_status can only ever be
  // changed by trusted server code (this route + the MEPS webhook), never
  // directly by a signed-in user's browser session.
  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      // plan + current_period_end are left untouched on purpose — access
      // continues until the period already paid for actually ends.
    })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
