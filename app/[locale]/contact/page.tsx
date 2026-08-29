import { LegalPage } from "@/components/LegalPage";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: `${t("title")} — ShelfShot AI` };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <LegalPage title={t("title")} updatedAt={t("updatedAt")}>
      <p>{t("intro")}</p>

      <div className="flex items-center gap-3 bg-panel border border-line rounded-xl2 p-5 not-prose">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Mail className="text-amber-400" size={18} />
        </div>
        <a href="mailto:info@shelfshotai.com" className="text-amber-400 hover:text-amber-300 font-semibold">
          info@shelfshotai.com
        </a>
      </div>

      <h2>{t("activityTitle")}</h2>
      <p>{t("activityBody")}</p>
    </LegalPage>
  );
}
