import HomeContent from "@/components/HomeContent";
import { getContent } from "@/lib/content";

/**
 * Home.
 *
 * A Server Component whose only job is reading the copy from cemapi and
 * handing it to the client half. The split exists because the page is
 * interactive (the car rotates through the week, the lights toggle) but its
 * text has to be in the server-rendered HTML: an `<h1>` filled in by the
 * browser is an `<h1>` the crawler never sees.
 *
 * Because `getContent()` fetches with a revalidate window, editing a title in
 * the panel updates this page without a rebuild.
 */
export default async function Home() {
  const content = await getContent();

  return (
    <HomeContent
      content={{
        h1: content.h1("Titulo h1 home page", "AUTODIAGNÓSTICO PANJOS"),
        h2: content.h2("h2 home page", "SERVICIO MECÁNICO MULTIMARCA"),
        text: content.text(
          "texto home page",
          "Tenemos mas de una decada de experiencia en el mercado, en autodiagnostico panjos, brindamos un servicio de confianza y alta calidad para automotores de todas las marcas y modelos. Atención especializada y garantía en cada reparación. La confianza de nuestros clientes es nuestro mayor activo, ofrecemos atención rápida y personalizada. Ubicados en Palermo, Montevideo."
        ),
        image: content.image("home-image", {
          src: "/image.avif",
          alt: "Mecánico trabajando en el taller Autodiagnóstico Panjos, Palermo, Montevideo",
        }),
      }}
    />
  );
}
