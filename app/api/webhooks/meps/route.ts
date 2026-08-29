import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyMepsSignature } from "@/lib/meps";

// MEPS calls this URL server-to-server after a transaction completes.
// It is NOT a browser redirect - there is no logged-in session here, so we
// use the service-role admin client (bypasses RLS) instead of the normal
// cookie-based server client.
//
// SECURITY: this endpoint is public and unauthenticated by nature (PayTabs
// can't send us a login session), so it MUST verify the "Signature" header
// PayTabs sends (HMAC-SHA256 of the raw body, keyed with MEPS_SERVER_KEY)
// before trusting anything in the payload. Previously this route trusted
// the incoming JSON body outright, which meant anyone who could guess or
// observe a cart_id could POST a fake "Authorised" result here and get a
// paid plan for free. See lib/meps.ts#verifyMepsSignature and:
// https://support.paytabs.com/en/support/solutions/articles/60000718961

export async function POST(req: NextRequest) {
  // Read the raw text first: verification must run against the exact bytes
  // PayTabs sent, not a re-serialized copy of the parsed JSON.
  const rawBody = await req.text();
  const signature = req.headers.get("signature");

  if (!verifyMepsSignature(rawBody, signature)) {
    console.error("MEPS webhook: missing or invalid Signature header — rejecting request.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const cartId: string | undefined = payload?.cart_id;
  const tranRef: string | undefined = payload?.tran_ref;
  const status: string | undefined = payload?.payment_result?.response_status; // "A" = Authorised

  if (!cartId) {
    return NextResponse.json({ error: "Missing cart_id" }, { status: 400 });
  }

  const success = status === "A";
  const supabase = createAdminClient();

  const { data: txn, error: txnError } = await supabase
    .from("transactions")
    .update({ status: success ? "paid" : "failed", tran_ref: tranRef })
    .eq("cart_id", cartId)
    .select("user_id, plan_id")
    .single();

  if (txnError) {
    console.error("MEPS webhook: failed to update transaction", txnError);
    return NextResponse.json({ error: "Transaction update failed" }, { status: 500 });
  }

  if (success && txn) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        plan: txn.plan_id,
        subscription_status: "active",
        // Adjust billing period length if your plans aren't monthly.
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .eq("id", txn.user_id);

    if (profileError) {
      console.error("MEPS webhook: failed to activate subscription", profileError);
      return NextResponse.json({ error: "Subscription update failed" }, { status: 500 });
    }
  }

  // MEPS just needs a 200 response to know the callback was received.
  return NextResponse.json({ received: true });
}
