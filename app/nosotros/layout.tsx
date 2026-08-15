import type { Metadata } from "next";

// Distinct from the page's <h1> ("Sobre nosotros").
export const metadata: Metadata = {
  title: "El taller: más de una década en Palermo",
  description:
    "Quiénes somos: taller mecánico multimarca con más de 10 años en Palermo, Montevideo, a pocas cuadras de la Intendencia. Atención personalizada y garantía en cada reparación.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    url: "/nosotros",
    title: "Sobre el taller | Autodiagnóstico Panjos",
    description:
      "Más de una década reparando autos de todas las marcas en Palermo, Montevideo. Atención personalizada y garantía.",
  },
};

export default function NosotrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
