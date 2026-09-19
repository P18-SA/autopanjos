import type { Metadata } from "next";

/**
 * Página "escondida": solo se llega desde la pregunta de /nosotros y
 * /servicios "¿Qué puedo hacer mientras mi auto está en el taller?". Por eso
 * no está en el menú, ni en `routes` (sitemap), y se marca noindex para que
 * tampoco aparezca suelta en buscadores.
 */
export const metadata: Metadata = {
  title: "Qué hacer cerca del taller mientras esperas",
  description:
    "Paseos a pocas cuadras del taller en Isla de Flores 1691, Palermo: la Rambla, Playa Ramírez, el Parque Rodó y el Museo Nacional de Artes Visuales.",
  alternates: { canonical: "/mientras-esperas" },
  robots: { index: false, follow: true },
};

export default function MientrasEsperasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
