import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-display", weight: ["600", "700", "800"] });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], variable: "--font-body", weight: ["400", "500", "600"] });

// عنوان ووصف الصفحة يتغيران حسب اللغة (عربي أو إنجليزي)
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

// يولّد صفحات ثابتة للغتين (ar / en) وقت البناء
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  // لو حد جرب يفتح لغة مو مدعومة (مثلاً /fr) نرجعله 404
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} ${plexArabic.variable}`}>
      <body className="font-body antialiased">
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZZH6LLLYYG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZZH6LLLYYG');
          `}
        </Script>

        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
