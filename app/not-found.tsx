import type { Metadata } from "next";
import NotFoundContent from "@/components/NotFoundContent";

/**
 * Kept as a server component purely so it can export metadata — the animated
 * markup lives in the client component it renders.
 */
export const metadata: Metadata = {
  title: "Página no encontrada",
  description:
    "La página que buscás no existe. Volvé al inicio de Autodiagnóstico Panjos, taller mecánico multimarca en Palermo, Montevideo.",
  // An error page has no business in the index, and shouldn't dilute the
  // crawl budget — but its links are still worth following.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundContent />;
}
