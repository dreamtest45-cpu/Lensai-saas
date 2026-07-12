import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { planFromPriceId } from "@/lib/plans";
import Stripe from "stripe";

export const runtime = "nodejs";

// Stripe calls this endpoint directly (not the browser), so it uses the
// service-role Supabase client and verifies the signature instead of a user session.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.type === "checkout.session.completed"
        ? await stripe.subscriptions.retrieve((event.data.object as Stripe.Checkout.Session).subscription as string)
        : (event.data.object as Stripe.Subscription);

      const userId = subscription.metadata?.supabase_user_id;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = planFromPriceId(priceId);

      if (userId) {
        await supabase.from("profiles").update({
          plan,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId) {
        await supabase.from("profiles").update({
          plan: "free",
          subscription_status: "canceled",
        }).eq("id", userId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
