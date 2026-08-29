import { NextRequest, NextResponse } from "next/server";

// MEPS redirects the customer's browser back here using an HTTP POST
// (not a normal GET navigation). Regular Next.js pages only handle GET,
// so a direct POST to /dashboard would 405. This route accepts that POST
// and issues a clean GET redirect to the dashboard instead.
//
// Point MEPS's "return" field at this route (see lib/meps.ts), not at
// /dashboard directly.

export async function POST(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL;
  // 303 forces the browser to follow up with a GET request.
  return NextResponse.redirect(`${appUrl}/dashboard?payment=complete`, 303);
}

// Some browsers/flows may still hit this with GET (e.g. user refreshes) -
// handle that too so it doesn't 405.
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return NextResponse.redirect(`${appUrl}/dashboard?payment=complete`, 303);
}
