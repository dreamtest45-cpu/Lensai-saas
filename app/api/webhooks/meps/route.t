import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// MEPS calls this URL server-to-server after a transaction completes.
// It is NOT a browser redirect - there is no logged-in session here, so we
// use the service-role admin client (bypasses RLS) instead of the normal
// cookie-based server client.

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const cartId: string | undefined = payload?.cart_id;
  const tranRef: string | undefined = payload?.tran_ref;
  const status: string | undefined = payload?.payment_result?.response_status; // "A" = Authorised

  if (!cartId) {
    return NextResponse.json({ error: "Missing cart_id" }, { status: 400 });
  }

  const success = status === "A";
  const supabase = createAdminClient();

  // TODO: confirm `transactions` and `subscriptions` table/column names below
  // match your actual schema.
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
    const { error: subError } = await supabase.from("subscriptions").upsert({
      user_id: txn.user_id,
      plan_id: txn.plan_id,
      status: "active",
      // Adjust billing period length/field name to match your schema.
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    if (subError) {
      console.error("MEPS webhook: failed to activate subscription", subError);
      return NextResponse.json({ error: "Subscription update failed" }, { status: 500 });
    }
  }

  // MEPS just needs a 200 response to know the callback was received.
  return NextResponse.json({ received: true });
}
