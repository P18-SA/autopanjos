import type { Metadata } from "next";
import { Anton, Barlow } from "next/font/google";
import "./globals.css";
import { siteUrl, businessName, address } from "@/lib/site";
import MobileCallBar from "@/components/MobileCallBar";

/**
 * Both original families were system-only fonts: Impact (absent on Android
 * and most Linux) and Microsoft Yi Baiti (Windows-only). Chrome on Android
 * therefore had nothing to match and silently fell back to its default sans,
 * which is why the site looked wrong there.
 *
 * These are the self-hosted replacements, served from our own domain by
 * next/font, so every device renders identically:
 *   - Anton  → the standard web stand-in for Impact: tall, condensed, heavy.
 *   - Barlow → a low-contrast grotesque with the narrow proportions and light
 *              stroke of Yi Baiti's Latin glyphs.
 *
 * They are exposed as CSS variables (rather than applied via `.className`)
 * because the whole app already selects fonts through the `.font-impact` /
 * `.font-yi-baiti` utilities in globals.css — those now point here, so not a
 * single component had to change.
 */
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const barlow = Barlow({
  // The weights actually used on screen: `font-normal`, `font-semibold`
  // (mobile call bar) and `font-bold` (contact address).
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});


export const metadata: Metadata = {
  // metadataBase makes every relative OG/canonical URL below resolve to an
  // absolute one, which is what crawlers and social scrapers require.
  metadataBase: new URL(siteUrl),
  title: {
    // Home page title. Deliberately different from its <h1>
    // ("Autodiagnóstico Panjos" / "Servicio mecánico multimarca…"): the title
    // targets the search query, the h1 speaks to the visitor already on-page.
    default: "Taller mecánico multimarca en Montevideo | Autodiagnóstico Panjos",
    // Every child route supplies only its own name; the brand is appended here.
    template: "%s | Autodiagnóstico Panjos",
  },
  description:
    "Taller mecánico multimarca en Palermo, Montevideo. Inyección electrónica, frenos, alineación y balanceo, cambio de aceite y diagnóstico computarizado. Presupuesto sin cargo.",
  applicationName: businessName,
  authors: [{ name: businessName }],
  creator: businessName,
  keywords: [
    "taller mecánico Montevideo",
    "mecánica multimarca",
    "inyección electrónica",
    "autodiagnóstico",
    "alineación y balanceo",
    "cambio de aceite Montevideo",
    "taller Palermo Montevideo",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_UY",
    siteName: businessName,
    url: "/",
    title: "Taller mecánico multimarca en Montevideo | Autodiagnóstico Panjos",
    description:
      "Servicio mecánico multimarca en Palermo, Montevideo. Diagnóstico computarizado, inyección electrónica, frenos y mantenimiento general.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/**
 * LocalBusiness structured data. An auto shop is a local-intent business, so
 * this is what lets Google associate the site with the physical address and
 * show it in local results — it is the highest-leverage markup for this site.
 */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: businessName,
  url: siteUrl,
  image: `${siteUrl}/panjos20.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: address.street,
    addressLocality: address.city,
    addressRegion: address.neighbourhood,
    addressCountry: "UY",
  },
  areaServed: "Montevideo, Uruguay",
  hasMap: address.mapsUrl,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-UY"
      className={`${anton.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060606] text-white selection:bg-red-900 selection:text-white">
        <script
          type="application/ld+json"
          // Static, developer-authored object — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {children}
        {/* Fixed call CTA, mobile only. Self-hides until lib/site.ts has a
            phone number, so it is safe to mount site-wide already. */}
        <MobileCallBar />
      </body>
    </html>
  );
}
