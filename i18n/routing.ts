import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // اللغات المدعومة بالموقع
  locales: ["ar", "en"],
  // اللغة الافتراضية (تظهر بدون بادئة /ar فعلياً بسبب localePrefix: "as-needed" تحت)
  defaultLocale: "ar",
  // العربي بدون بادئة بالرابط (shelfshotai.com/about) والإنجليزي بـ /en (shelfshotai.com/en/about)
  localePrefix: "as-needed",
});
