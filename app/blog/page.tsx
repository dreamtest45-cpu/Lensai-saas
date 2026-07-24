import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata = {
  title: "المدونة | ShelfShot AI",
  description: "مقالات ونصائح عملية لأصحاب المتاجر حول تصوير المنتجات وزيادة المبيعات.",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen grain">
      <nav className="border-b border-line/60">
        <div className="container mx-auto max-w-4xl px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/icon.png" alt="ShelfShot AI" className="w-9 h-9" />
            <span className="font-display font-bold text-lg tracking-tight">ShelfShot AI</span>
          </Link>
          <Link href="/" className="text-sm text-white/50 hover:text-white flex items-center gap-1">
            الرئيسية
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-6 py-14">
        <h1 className="font-display font-bold text-3xl mb-2">المدونة</h1>
        <p className="text-white/50 mb-10">نصائح عملية لأصحاب المتاجر حول تصوير المنتجات وزيادة المبيعات.</p>

        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-panel border border-line rounded-xl2 p-6 hover:border-amber-500/40 transition-colors"
            >
              <p className="text-xs text-white/40 mb-2">{post.date}</p>
              <h2 className="font-bold text-xl mb-2">{post.title}</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-3">{post.excerpt}</p>
              <span className="text-amber-400 text-sm font-semibold flex items-center gap-1">
                اقرأ المقال
                <ArrowLeft size={14} />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-line/60 py-10 mt-10">
        <div className="container mx-auto max-w-4xl px-6 text-sm text-white/30 text-center">
          © {new Date().getFullYear()} ShelfShot AI
        </div>
      </footer>
    </div>
  );
}
