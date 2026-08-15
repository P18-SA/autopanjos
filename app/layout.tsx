import type { Metadata } from "next";
import "./globals.css";
import { siteUrl, businessName, address } from "@/lib/site";
import MobileCallBar from "@/components/MobileCallBar";

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
    <html lang="es-UY" className="h-full antialiased">
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
