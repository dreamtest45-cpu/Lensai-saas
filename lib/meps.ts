// MEPS (PayTabs Jordan) payment integration
// Docs: Transaction API — https://secure-jordan.paytabs.com/payment/request
//
// Required env vars (set in Vercel + .env.local):
//   MEPS_PROFILE_ID=182942
//   MEPS_SERVER_KEY=<server key from "مفاتيح الربط" -> "مفتاح الخادم">
//   NEXT_PUBLIC_APP_URL=https://www.shelfshotai.com
//
// IMPORTANT: use the SERVER key here, not the client key. The server key
// goes in the Authorization header and must never be exposed to the browser.

const MEPS_ENDPOINT = "https://secure-jordan.paytabs.com/payment/request";

interface CreatePaymentParams {
  cartId: string; // unique order reference, e.g. `${userId}-${planId}-${Date.now()}`
  amount: number; // plan price, e.g. 6, 15, 39
  currency?: string; // defaults to USD per your pricing
  description: string;
  customerEmail?: string;
  customerName?: string;
}

interface MepsPaymentResponse {
  tran_ref?: string;
  redirect_url?: string; // present when the customer needs to complete 3-D Secure / hosted page
  payment_result?: {
    response_status: string; // "A" = Authorised (success)
    response_message?: string;
  };
  [key: string]: unknown;
}

export async function createMepsPayment({
  cartId,
  amount,
  currency = "USD",
  description,
  customerEmail,
  customerName,
}: CreatePaymentParams): Promise<MepsPaymentResponse> {
  const profileId = process.env.MEPS_PROFILE_ID;
  const serverKey = process.env.MEPS_SERVER_KEY;
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!profileId || !serverKey || !appUrl) {
    throw new Error(
      "Missing MEPS_PROFILE_ID, MEPS_SERVER_KEY, or NEXT_PUBLIC_SITE_URL env vars"
    );
  }

  const body: Record<string, unknown> = {
    profile_id: Number(profileId),
    tran_type: "sale",
    tran_class: "ecom",
    cart_id: cartId,
    cart_description: description,
    cart_currency: currency,
    cart_amount: amount,
    callback: `${appUrl}/api/webhooks/meps`,
    return: `${appUrl}/api/meps-return`,
  };

  if (customerEmail || customerName) {
    body.customer_details = {
      name: customerName ?? "ShelfShot AI Customer",
      email: customerEmail ?? "noreply@shelfshotai.com",
      // MEPS/PayTabs sometimes requires street/city/state/country/ip for
      // fraud scoring depending on your risk settings. Add here if MEPS
      // support tells you transactions are being flagged/declined without it.
    };
  }

  const res = await fetch(MEPS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: serverKey,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as MepsPaymentResponse;

  if (!res.ok) {
    throw new Error(
      (data as any)?.message ||
        (data as any)?.result ||
        "MEPS payment request failed"
    );
  }

  return data;
}
