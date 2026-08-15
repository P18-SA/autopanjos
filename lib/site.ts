/**
 * Single source of truth for business + SEO data.
 *
 * Everything that needs the production domain (sitemap.xml, robots.txt,
 * llms.txt, Open Graph metadataBase) reads `siteUrl` from here, so switching
 * to the real domain is a one-line change that propagates everywhere.
 */

// ⚠️ REPLACE ME — placeholder domain.
// Absolute URLs are mandatory in a sitemap, and Open Graph/Twitter cards need
// an absolute base too, so this cannot be left as a relative path.
export const siteUrl = "https://autopanjos.com";

/**
 * ⚠️ REPLACE ME — no phone number exists anywhere in this project yet.
 *
 * Deliberately left empty rather than filled with a plausible-looking number:
 * this string becomes a `tel:` link that real customers tap, so a wrong value
 * is worse than no button. `MobileCallBar` renders nothing while this is
 * empty, and starts working the moment a number is filled in.
 *
 * Format it exactly as it should be dialled, e.g. "+59899123456".
 */
export const phoneNumber = "+59899334970";

/** Human-readable version of `phoneNumber`, shown on screen. */
export const phoneDisplay = "(+598) 99 334 970";

/** WhatsApp number in wa.me format (digits only, no +). Optional. */
export const whatsappNumber = "+59899334970";

export const contactEmail = "autopanjos@adinet.com.uy";

export const businessName = "Autodiagnóstico Panjos";

export const address = {
  street: "Isla de Flores 1691",
  neighbourhood: "Palermo",
  city: "Montevideo",
  country: "Uruguay",
  mapsUrl: "https://maps.app.goo.gl/YEKdUq6c6ZstDCCJ7",
};

/**
 * Route inventory. `sitemap.ts` iterates this, so a new page only has to be
 * added here once instead of in several places.
 */
export const routes = [
  { path: "/", priority: 1.0, changeFrequency: "monthly" as const },
  { path: "/servicios", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/nosotros", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "/contacto", priority: 0.8, changeFrequency: "yearly" as const },
];
