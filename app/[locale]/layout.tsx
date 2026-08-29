import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-display", weight: ["600", "700", "800"] });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], variable: "--font-body", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "ShelfShot AI — استوديو تصوير المنتجات بالذكاء الاصطناعي",
  description: "حوّل صور منتجاتك العادية إلى لقطات تصوير احترافية وسينمائية خلال ثوانٍ، بدون استوديو تصوير أو مصمم.",
};

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
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
