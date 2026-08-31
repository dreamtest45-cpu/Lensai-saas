import { NextRequest, NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Handles email confirmation via token_hash — works from any device or
// email app (Gmail app, Outlook, etc.) without needing the original
// browser's PKCE code verifier.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next");

  // Only allow a same-site relative path — never redirect off-domain.
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Failed or missing params — send to login with an error flag instead
  // of silently landing on a dashboard with no session.
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
