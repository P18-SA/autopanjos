import type { Metadata } from "next";

// Distinct from the page's <h1> ("Servicios mecánicos"): the title targets the
// query, the h1 addresses the visitor.
export const metadata: Metadata = {
  title: "Inyección electrónica, frenos y alineación",
  description:
    "Servicios del taller: inyección electrónica, limpieza y cambio de inyectores, frenos, alineación y balanceo, cambio de aceite y filtros. Todas las marcas y modelos, en Montevideo.",
  alternates: { canonical: "/servicios" },
  openGraph: {
    url: "/servicios",
    title: "Servicios del taller | Autodiagnóstico Panjos",
    description:
      "Inyección electrónica, frenos, alineación y balanceo, cambio de aceite y diagnóstico computarizado en Palermo, Montevideo.",
  },
};

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
