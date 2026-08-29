import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the redirect after a magic-link email or OAuth sign-in,
// exchanging the auth code for a session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");

  // Only allow a same-site relative path here — never redirect off-domain.
  // Without this check, a crafted `?next=` value could turn this into an
  // open-redirect (e.g. used in phishing links that otherwise look like a
  // legitimate shelfshotai.com auth link).
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
