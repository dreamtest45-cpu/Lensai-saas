import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Cancels the current user's subscription. This is an IMMEDIATE downgrade to
// the free plan - there is no scheduled/end-of-period cancellation yet since
// that would require a cron job to actually revoke access later. If you want
// "stay active until period end" behavior, that needs to be added separately.

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
    .select("plan")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!profile || profile.plan === "free") {
    return NextResponse.json({ error: "لا يوجد اشتراك فعّال لإلغائه" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      subscription_status: "cancelled",
      current_period_end: null,
    })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
