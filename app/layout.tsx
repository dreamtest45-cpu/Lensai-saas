import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-display", weight: ["600", "700", "800"] });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], variable: "--font-body", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "ShelfShot AI — استوديو تصوير المنتجات بالذكاء الاصطناعي",
  description: "حوّل صور منتجاتك العادية إلى لقطات تصوير احترافية وسينمائية خلال ثوانٍ، بدون استوديو تصوير أو مصمم.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${plexArabic.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
