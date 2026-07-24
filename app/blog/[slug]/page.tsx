import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | ShelfShot AI`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  return (
    <div className="min-h-screen grain">
      <nav className="border-b border-line/60">
        <div className="container mx-auto max-w-3xl px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/icon.png" alt="ShelfShot AI" className="w-9 h-9" />
            <span className="font-display font-bold text-lg tracking-tight">ShelfShot AI</span>
          </Link>
          <Link href="/blog" className="text-sm text-white/50 hover:text-white flex items-center gap-1">
            المدونة
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-6 py-14">
        <p className="text-xs text-white/40 mb-3">{post.date}</p>
        <h1 className="font-display font-bold text-3xl mb-8 leading-snug">{post.title}</h1>

        <div className="space-y-8 text-white/70 leading-relaxed">
          {post.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-white font-bold text-lg mb-2">{section.heading}</h2>
              {section.body.split("\n\n").map((para, j) => (
                <p key={j} className="mb-3">{para}</p>
              ))}
            </div>
          ))}

          <div className="border-t border-line/60 pt-6">
            <p>{post.conclusion}</p>
          </div>
        </div>

        <div className="mt-12 bg-panel border border-line rounded-xl2 p-6 text-center">
          <p className="text-white/70 mb-4">جرّبي ShelfShot AI مجاناً وحوّلي صور منتجاتك لجودة استوديو احترافي.</p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-l from-amber-500 to-orange-600 text-ink font-bold px-6 py-2.5 rounded-full text-sm"
          >
            جرّب مجاناً الآن
          </Link>
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
