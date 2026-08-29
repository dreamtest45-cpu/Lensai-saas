import { LegalPage } from "@/components/LegalPage";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface Section {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  hasContactLink?: boolean;
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: `${t("title")} — ShelfShot AI` };
}

export default async function TermsPage() {
  const t = await getTranslations("terms");
  const sections = t.raw("sections") as Section[];

  return (
    <LegalPage title={t("title")} updatedAt={t("updatedAt")}>
      <p>{t("intro")}</p>

      {sections.map((s, i) => (
        <div key={i}>
          <h2>{s.heading}</h2>
          {s.paragraphs?.map((p, j) => (
            <p key={j}>
              {p}
              {s.hasContactLink && (
                <>
                  {" "}
                  <Link href="/contact" className="text-amber-400 hover:text-amber-300 underline">
                    {t("contactLinkLabel")}
                  </Link>
                  .
                </>
              )}
            </p>
          ))}
          {s.items && (
            <ul>
              {s.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </LegalPage>
  );
}
