import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getTranslations } from "next-intl/server";

interface Props {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

export async function LegalPage({ title, updatedAt, children }: Props) {
  const t = await getTranslations("nav");

  return (
    <div className="min-h-screen grain">
      <nav className="border-b border-line/60">
        <div className="container mx-auto max-w-3xl px-6 py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/icon.png" alt="ShelfShot AI" className="w-9 h-9" />
            <span className="font-display font-bold text-base sm:text-lg tracking-tight">ShelfShot AI</span>
          </Link>
          <div className="flex items-center flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className="text-sm text-white/50 hover:text-white flex items-center gap-1">
              <ArrowRight size={14} />
              {t("home")}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-display font-bold text-3xl mb-2">{title}</h1>
        <p className="text-white/40 text-sm mb-10">{updatedAt}</p>
        <div className="space-y-6 text-white/70 leading-relaxed [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:space-y-1.5">
          {children}
        </div>
      </main>

      <footer className="border-t border-line/60 py-10 mt-10">
        <div className="container mx-auto max-w-3xl px-6 text-sm text-white/30 text-center">
          © {new Date().getFullYear()} ShelfShot AI
        </div>
      </footer>
    </div>
  );
}
