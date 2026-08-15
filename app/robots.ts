import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Served at /robots.txt by Next's metadata file convention.
 *
 * Generated rather than dropped in /public so the Sitemap line always points
 * at the real domain from lib/site.ts — a hardcoded one silently rots when
 * the domain changes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Next internals: no value as search results, and crawling them just
        // burns crawl budget.
        disallow: ["/_next/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
