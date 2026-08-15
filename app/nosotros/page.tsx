"use client";

import Image from "next/image";
import Header from "@/components/Header";
import FaqSection from "@/components/FaqSection";
import LiquidBackground from "@/components/LiquidBackground";

export default function ServiciosPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#060606] text-white overflow-x-hidden flex flex-col justify-between select-none">
      {/* Animated gradient field. First in the DOM and at z-0 so every
          section below paints on top of it. */}
      <LiquidBackground />

      {/* Header: Shared Top Navigation Bar */}
      <Header />

      {/* Hero Content Section */}
      <section className="relative z-10 w-full min-h-screen flex flex-col justify-between pt-20 sm:pt-24 pb-6 px-6 sm:px-10 md:px-12">
        <div className="relative z-20 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-stretch pt-2 pb-2 my-auto">
          {/* Column 1 (Left: Huge Title + Subtitle & Indicator) */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-between h-full py-2 animate-component-left">
            {/* Main Title - Extra Large */}
            <div className="mt-2 md:mt-4 mb-auto">
              <h1 className="font-impact text-7xl sm:text-9xl md:text-[130px] lg:text-[160px] xl:text-[185px] uppercase text-white leading-[0.82] tracking-tighter drop-shadow-2xl opacity-95">
                SOBRE
                <br />
                NOSOTROS
              </h1>
            </div>


            {/* Bottom Subtitle & Slider/Indicator */}
            <div className="max-w-md w-full pt-8 pointer-events-auto">
              <h2 className="font-impact text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-wider mb-2">
                MÁS DE UNA DÉCADA EN PALERMO
              </h2>

              {/* TL;DR — who/where/what, before the longer description. */}
              <p className="font-yi-baiti text-xs sm:text-sm text-gray-200 leading-snug mb-3">
                <span className="text-red-500 font-bold">TL;DR:</span> Taller
                mecánico multimarca con más de 10 años en Isla de Flores 1691,
                Palermo, Montevideo, a pocas cuadras de la Intendencia.
                Atendemos español, inglés y portugués. No contamos con remolque.
              </p>

              <p className="font-yi-baiti text-xs sm:text-sm text-gray-400 leading-snug mb-4">
                Mantenimiento y reparación integral de vehículos: cambio de aceite y filtro,
                revisión de frenos, alineación y balanceo.
                Nuestro taller en Montevideo garantiza calidad, rapidez y transparencia en cada servicio,
                para que disfrute siempre de un auto seguro y confiable.
                Encuentra nuestro taller cerca tuyo, ubicado a algunas cuadras de la intendecia de Montevideo.
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
                  src="/panjos20.png"
                  alt="Frente del taller Autodiagnóstico Panjos en Isla de Flores 1691, Palermo, Montevideo"
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
                    src="/panjos0.jpg"
                    alt="Vehículo sobre el elevador del taller Panjos durante una revisión mecánica"
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
                    src="/panjos11.jpg"
                    alt="Interior del taller Autodiagnóstico Panjos con herramientas y equipos de diagnóstico"
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
