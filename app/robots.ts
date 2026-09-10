import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api", "/login", "/reset-password", "/forgot-password"],
      },
    ],
    sitemap: "https://www.shelfshotai.com/sitemap.xml",
  };
}
