"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Languages } from "lucide-react";

// زر تبديل اللغة — يظهر بأي مكان تحطيه فيه بالهيدر
// يحافظ على نفس الصفحة الحالية وبس يبدّل اللغة
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "English" : "العربية";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white font-medium transition-colors"
      aria-label="Switch language"
    >
      <Languages size={16} />
      {label}
    </button>
  );
}
