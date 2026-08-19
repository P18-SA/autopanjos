import Image from "next/image";
import Header from "@/components/Header";
import FaqSection from "@/components/FaqSection";
import LiquidBackground from "@/components/LiquidBackground";
import { getContent } from "@/lib/content";
import { KEYS } from "@/lib/content-keys";

// A Server Component: nothing on this page is interactive, so the copy below
// can be fetched from the CMS and rendered into the HTML the crawler sees.
export default async function NosotrosPage() {
  const content = await getContent();

  const foto1 = content.image(KEYS.nosotrosFoto1, {
    src: "/panjos20.png",
    alt: "Frente del taller Autodiagnóstico Panjos en Isla de Flores 1691, Palermo, Montevideo",
  });
  const foto2 = content.image(KEYS.nosotrosFoto2, {
    src: "/panjos0.jpg",
    alt: "Vehículo sobre el elevador del taller Panjos durante una revisión mecánica",
  });
  const foto3 = content.image(KEYS.nosotrosFoto3, {
    src: "/panjos11.jpg",
    alt: "Interior del taller Autodiagnóstico Panjos con herramientas y equipos de diagnóstico",
  });

  return (
    <div className="relative w-full min-h-screen bg-[#060606] text-white overflow-x-hidden flex flex-col justify-between select-none">
      {/* Animated gradient field. First in the DOM and at z-0 so every
          section below paints on top of it. */}
      <LiquidBackground />

      {/* Header: Shared Top Navigation Bar */}
      <Header />

      {/* Hero Content Section */}
      <section className="pb-mobile-cta relative z-10 w-full min-h-screen flex flex-col justify-between pt-20 sm:pt-24 pb-6 px-6 sm:px-10 md:px-12">
        <div className="relative z-20 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-stretch pt-2 pb-2 my-auto">
          {/* Column 1 (Left: Huge Title + Subtitle & Indicator) */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-between h-full py-2 animate-component-left">
            {/* Main Title - Extra Large */}
            <div className="mt-2 md:mt-4 mb-auto">
              <h1 className="font-impact text-7xl sm:text-9xl md:text-[130px] lg:text-[160px] xl:text-[185px] uppercase text-white leading-[0.82] tracking-tighter drop-shadow-2xl opacity-95">
                {content.h1(KEYS.nosotrosH1, "SOBRE NOSOTROS")}
              </h1>
            </div>


            {/* Bottom Subtitle & Slider/Indicator */}
            <div className="max-w-md w-full pt-8 pointer-events-auto">
              <h2 className="font-impact text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-wider mb-2">
                {content.h2(KEYS.nosotrosH2, "MÁS DE UNA DÉCADA EN PALERMO")}
              </h2>

              <p className="font-yi-baiti text-xs sm:text-sm text-gray-400 leading-snug mb-4">
                {content.text(
                  KEYS.nosotrosText,
                  "Mantenimiento y reparación integral de vehículos: cambio de aceite y filtro, revisión de frenos, alineación y balanceo. Nuestro taller en Montevideo garantiza calidad, rapidez y transparencia en cada servicio, para que disfrute siempre de un auto seguro y confiable. Encuentra nuestro taller cerca tuyo, ubicado a algunas cuadras de la intendecia de Montevideo."
                )}
              </p>

              {/* Slider Progress Indicator with Arrow */}
              <div className="flex items-center space-x-3 w-64 sm:w-110">
                <div className="relative flex-1 h-[2px] bg-white rounded-full overflow-hidden">
                </div>
                <div className="relative flex-1 h-[2px] bg-white rounded-full" />
              </div>
            </div>
          </div>

          {/* Column 2 (Right: 3 Red Container Boxes) */}
          <div className="md:col-span-6 lg:col-span-6 flex items-center justify-end w-full h-full animate-component-right">
            <div className="grid grid-cols-2 gap-5 md:gap-6 w-full h-[340px] sm:h-[460px] md:h-[520px] lg:h-[580px] items-center">
              {/* Left Image Container */}
              <div className="red-container-box relative w-full h-[78%] my-auto group shadow-2xl">
                <Image
                  src={foto1.src}
                  alt={foto1.alt}
                  title="Taller Autodiagnóstico Panjos, Palermo, Montevideo"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Right Column Containers */}
              <div className="flex flex-col gap-5 md:gap-6 h-full justify-between">
                {/* Top Right Container */}
                <div className="red-container-box relative w-full h-[38%] group shadow-2xl">
                  <Image
                    src={foto2.src}
                    alt={foto2.alt}
                    title="Elevador del taller Autodiagnóstico Panjos"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>

                {/* Bottom Right Container */}
                <div className="red-container-box relative w-full h-[80%] group shadow-2xl">
                  <Image
                    src={foto3.src}
                    alt={foto3.alt}
                    title="Interior del taller Autodiagnóstico Panjos"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <FaqSection />
    </div>
  );
}
