import type { Metadata } from "next";

// Distinct from the page's <h1> ("Contacto").
export const metadata: Metadata = {
  title: "Dónde estamos y cómo pedir turno",
  description:
    "Isla de Flores 1691, Palermo, Montevideo, a pocas cuadras de la Intendencia. Escribinos para coordinar tu reparación o pedir presupuesto sin cargo.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    url: "/contacto",
    title: "Contacto y ubicación | Autodiagnóstico Panjos",
    description:
      "Isla de Flores 1691, Palermo, Montevideo. Coordiná tu reparación o pedí presupuesto.",
  },
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
