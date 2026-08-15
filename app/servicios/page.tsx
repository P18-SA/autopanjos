"use client";

import Header from "@/components/Header";
import ServiceCardsStack from "@/components/ServiceCardsStack";
import FaqSection from "@/components/FaqSection";

const SERVICES_DATA = [
  {
    number: "01",
    title: "Inyección electrónica",
    description:
      "Sistema que controla electrónicamente la cantidad de combustible que se inyecta en el motor, mejorando el rendimiento y reduciendo emisiones.",
    subheading: "Servicios más frecuentes:",
    frequentServices: [
      "Limpieza de Inyectores",
      "Cambio de Inyectores",
      "Diagnóstico de Sensor de Oxígeno",
    ],
    imageSrc: "/serv-ie.png",
    imageAlt:
      "Servicio de inyección electrónica: limpieza y cambio de inyectores en Autodiagnóstico Panjos",
  },
  {
    number: "02",
    title: "Mecánica Integral",
    description:
      "Rama de la mecánica automotriz que abarca el diagnóstico, mantenimiento y reparación de todos los sistemas principales del vehículo, asegurando su funcionamiento óptimo.",
    subheading: "Servicios más frecuentes:",
    frequentServices: [
      "Cambio de Aceite y Filtro",
      "Revisión de Frenos",
      "Cambio de Pastillas de Freno",
    ],
    imageSrc: "/serv-me.png",
    imageAlt:
      "Mecánica integral: cambio de aceite, filtros y revisión de frenos en Autodiagnóstico Panjos",
  },
  {
    number: "03",
    title: "Electrónica Automotriz",
    description:
      "Disciplina que integra sistemas eléctricos y electrónicos en los vehículos, permitiendo funciones como control de motor, seguridad y entretenimiento.",
    subheading: "Servicios más frecuentes:",
    frequentServices: [
      "Diagnóstico Computarizado",
      "Reparacion de Arranques",
      "Revisión de Fusibles y Relés",
    ],
    imageSrc: "/serv-3.png",
    imageAlt:
      "Electrónica automotriz: diagnóstico computarizado y reparación de arranques en Autodiagnóstico Panjos",
  },
  {
    number: "04",
    title: "Aire Acondicionado",
    description:
      "Sistema que regula la temperatura, humedad y limpieza del aire dentro del vehículo para proporcionar confort al conductor y pasajeros.",
    subheading: "Servicios más frecuentes:",
    frequentServices: [
      "Recarga de Gas",
      "Cambio de Filtro de Cabina",
      "Diagnóstico de Compresor",
    ],
    imageSrc: "/serv-4.png",
    imageAlt:
      "Servicio de aire acondicionado automotriz: recarga de gas y cambio de filtro de cabina",
  },
  {
    number: "05",
    title: "Alineación y Balanceo",
    description:
      "Procedimientos que corrigen la posición del volante y equilibran el peso de las ruedas para asegurar una conducción estable y evitar desgaste irregular.",
    subheading: "Servicios más frecuentes:",
    frequentServices: [
      "Alineación y Balanceo",
      "Balanceo Dinámico",
      "Reparacion de Suspensión",
    ],
    imageSrc: "/serv-5.png",
    imageAlt:
      "Alineación y balanceo de ruedas y reparación de suspensión en Autodiagnóstico Panjos",
  },
];

export default function ServiciosPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#060606] text-white overflow-x-hidden flex flex-col justify-between select-none">
      {/* Header: Shared Top Navigation Bar */}
      <Header />

      {/* Hero Content Section */}
      <section className="relative w-full min-h-screen flex flex-col justify-between pt-20 sm:pt-24 pb-12 px-6 sm:px-10 md:px-12">
        <div className="relative z-20 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-stretch pt-2 pb-2 my-auto">
          {/* Column 1 (Left: Huge Title + Subtitle & Indicator) */}
          <div className="md:col-span-12 lg:col-span-12 flex flex-col justify-between h-full py-2 animate-component-left">
            {/* Main Title - Extra Large */}
            <div className="mt-2 md:mt-4 mb-auto">
              <h1 className="font-impact text-7xl sm:text-9xl md:text-[130px] lg:text-[160px] xl:text-[185px] uppercase text-white leading-[0.82] tracking-tighter drop-shadow-2xl opacity-95">
                SERVICIOS
                <br />
                MECÁNICOS
              </h1>
            </div>

            {/* Bottom Subtitle & Slider/Indicator */}
            <div className="max-w-md w-full pt-8 pointer-events-auto">
              {/* <h2 className="font-impact text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-wider mb-2">
                SERVICIO MECÁNICO MULTIMARCA
              </h2> */}
              {/* TL;DR — the list of services up front, so the search intent
                  ("what do they actually do?") is answered before scrolling
                  through the animated card stack below. */}
              <p className="font-yi-baiti text-xs sm:text-sm text-gray-200 leading-snug mb-3">
                <span className="text-red-500 font-bold">TL;DR:</span> Inyección
                electrónica (limpieza y cambio de inyectores, sensor de
                oxígeno), diagnóstico computarizado, frenos, alineación y
                balanceo, y cambio de aceite y filtros. Todas las marcas y
                modelos, en Palermo, Montevideo.
              </p>

              <p className="font-yi-baiti text-xs sm:text-sm text-gray-400 leading-snug mb-4">
                Servicios de calidad garantizada para automotores de todas las marcas y modelos.
                Ofrecemos una amplia gama de servicios para satisfacer las necesidades de nuestros clientes.
              </p>

              {/* Slider Progress Indicator with Arrow */}
              <div className="flex items-center space-x-3 w-64 sm:w-110">
                <div className="relative flex-1 h-[2px] bg-white rounded-full overflow-hidden">
                </div>
                <div className="relative flex-1 h-[2px] bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services List Stack Section with GSAP Layered Stacking Animation.
          The h2 below is the missing rung in the heading ladder: each card
          inside the stack is an h3, so without it the document jumped h1 → h3. */}
      <section aria-labelledby="servicios-listado">
        <h2 id="servicios-listado" className="sr-only">
          Listado de servicios del taller
        </h2>
        <ServiceCardsStack services={SERVICES_DATA} />
      </section>
    </div>
  );
}
