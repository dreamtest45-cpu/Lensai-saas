import { LegalPage } from "@/components/LegalPage";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface Section {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  hasContactLink?: boolean;
  paragraphSuffix?: string;
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "refund" });
  return { title: `${t("title")} — ShelfShot AI` };
}

export default async function RefundPage() {
  const t = await getTranslations("refund");
  const sections = t.raw("sections") as Section[];

  return (
    <LegalPage title={t("title")} updatedAt={t("updatedAt")}>
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
                  {" "}
                  {s.paragraphSuffix}
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
