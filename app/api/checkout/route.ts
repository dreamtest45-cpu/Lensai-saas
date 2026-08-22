import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // TODO: adjust import path to match your actual Supabase server client helper
import { createMepsPayment } from "@/lib/meps";
import { plans } from "@/lib/plans"; // TODO: confirm plans export shape matches { id, name, price } below

export async function POST(req: NextRequest) {
  const { planId } = await req.json();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const plan = plans.find((p) => p.id === planId);
  if (!plan || plan.price === 0) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const cartId = `${user.id}-${planId}-${Date.now()}`;

  try {
    const payment = await createMepsPayment({
      cartId,
      amount: plan.price,
      currency: "USD",
      description: `ShelfShot AI - ${plan.name} Subscription`,
      customerEmail: user.email ?? undefined,
    });

    // Record a pending transaction so the webhook can reconcile it later.
    // TODO: confirm your `transactions` table's actual column names match these.
    const { error: insertError } = await supabase.from("transactions").insert({
      user_id: user.id,
      cart_id: cartId,
      plan_id: planId,
      amount: plan.price,
      status: "pending",
    });

    if (insertError) {
      throw new Error(`Failed to record transaction: ${insertError.message}`);
    }

    // MEPS may return either a direct redirect_url (hosted page / 3-D Secure)
    // or a fully authorised result with no redirect needed. Handle both.
    const redirectUrl =
      (payment as any).redirect_url ?? (payment as any).payment_url ?? null;

    if (!redirectUrl && payment.payment_result?.response_status !== "A") {
      throw new Error(
        payment.payment_result?.response_message || "Payment could not be started"
      );
    }

    return NextResponse.json({ redirectUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
