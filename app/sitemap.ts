import type { MetadataRoute } from "next";
import { siteUrl, routes } from "@/lib/site";

/**
 * Served at /sitemap.xml by Next's metadata file convention.
 *
 * Driven by the `routes` list in lib/site.ts so adding a page means editing
 * one array, not remembering to touch the sitemap separately.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
