import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Scheduled daily by vercel.json's "crons" entry. Downgrades any account
// whose subscription was cancelled (app/api/cancel-subscription) AND whose
// already-paid-for period has actually ended, back to the free plan.
// Cancelling doesn't do this immediately, on purpose — see that route.
//
// SECURITY: protected with a shared secret so this can't be triggered by
// anyone who finds the URL. Vercel Cron automatically sends
// `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET is set as an env
// var on the project — see
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
// Set CRON_SECRET to a long random value in Vercel's Environment Variables
// before relying on this in production.

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      subscription_status: "expired",
      current_period_end: null,
    })
    .eq("subscription_status", "cancelled")
    .lt("current_period_end", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("downgrade-expired cron: failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ downgraded: data?.length ?? 0 });
}
