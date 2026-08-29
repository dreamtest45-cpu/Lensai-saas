import { LegalPage } from "@/components/LegalPage";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: `${t("title")} — ShelfShot AI` };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const items = t.raw("offerItems") as string[];

  return (
    <LegalPage title={t("title")} updatedAt={t("updatedAt")}>
      <p>{t("p1")}</p>
      <p>{t("p2")}</p>

      <h2>{t("offerTitle")}</h2>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </LegalPage>
  );
}
