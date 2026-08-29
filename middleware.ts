import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createIntlMiddleware(routing);

// يحمي مسار /dashboard مهما كانت اللغة (يشتغل مع أو بدون بادئة /en)
function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/en/dashboard" ||
    pathname.startsWith("/en/dashboard/");
}

export async function middleware(request: NextRequest) {
  // 1) نخلي next-intl يحدد/يعيد التوجيه حسب اللغة أول شي
  const intlResponse = intlMiddleware(request);

  // 2) لو المسار مو خاص بالداشبورد، ما في داعي نفحص جلسة Supabase
  if (!isDashboardPath(request.nextUrl.pathname)) {
    return intlResponse;
  }

  // 3) لمسارات الداشبورد: نفحص جلسة Supabase ونحدّث الكوكيز فوق استجابة next-intl
  let response = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    // نحافظ على نفس اللغة الحالية ونحوّل لصفحة تسجيل الدخول
    url.pathname = request.nextUrl.pathname.startsWith("/en")
      ? "/en/login"
      : "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // نطبّق الميدلوير على كل الصفحات ما عدا: api, ملفات Next الداخلية, وملفات ثابتة (صور، أيقونات...)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
