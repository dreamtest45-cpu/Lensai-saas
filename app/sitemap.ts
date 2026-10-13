import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.shelfshotai.com";

  const routes = ["", "/about", "/contact", "/blog", "/terms", "/privacy", "/refund"];

  // لكل صفحة نسختان: عربي (بدون بادئة) وإنجليزي (/en)، مع روابط تبديل اللغة
  const withLanguages = (path: string, lastModified: Date) => {
    const ar = `${baseUrl}${path}`;
    const en = `${baseUrl}/en${path}`;
    const alternates = { languages: { ar, en } };
    return [
      { url: ar, lastModified, alternates },
      { url: en, lastModified, alternates },
    ];
  };

  const staticRoutes = routes.flatMap((route) => withLanguages(route, new Date()));

  const blogRoutes = BLOG_POSTS.flatMap((post) =>
    withLanguages(`/blog/${post.slug}`, new Date(post.date))
  );

  return [...staticRoutes, ...blogRoutes];
}
