import Stripe from "stripe";

// Single shared Stripe server client. Server-only — never import from a client component.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});
