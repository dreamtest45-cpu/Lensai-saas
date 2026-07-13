import Link from "next/link";
import { Aperture, ArrowRight } from "lucide-react";

interface Props {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updatedAt, children }: Props) {
  return (
    <div className="min-h-screen grain">
      <nav className="border-b border-line/60">
        <div className="container mx-auto max-w-3xl px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Aperture className="text-ink" size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">ShelfShot AI</span>
          </Link>
          <Link href="/" className="text-sm text-white/50 hover:text-white flex items-center gap-1">
            <ArrowRight size={14} />
            الرئيسية
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-display font-bold text-3xl mb-2">{title}</h1>
        <p className="text-white/40 text-sm mb-10">آخر تحديث: {updatedAt}</p>
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
