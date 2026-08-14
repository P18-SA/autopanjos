"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

import Header from "@/components/Header";
import ArrowButton from "@/components/ArrowButton";

// Media-query plumbing for hiding the 3D car on phones.
//
// Kept at module scope so the function identities stay stable across renders
// (a fresh `subscribe` on every render would make React re-subscribe each
// time). useSyncExternalStore is used instead of useState+useEffect because
// it reads the query during render — no setState-in-effect, and no
// hydration mismatch.
const DESKTOP_QUERY = "(min-width: 768px)";

const subscribeToDesktop = (onChange: () => void) => {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getIsDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

// The server (and therefore the first paint) assumes mobile, so a phone
// never even starts downloading the model.
const getIsDesktopOnServer = () => false;

// Dynamically import CarCanvas to avoid SSR issues with Three.js WebGL
const CarCanvas = dynamic(() => import("@/components/CarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-white/40 font-yi-baiti text-base animate-pulse">
      Cargando 3D...
    </div>
  ),
});

interface ScheduledCar {
  day: string;
  name: string;
  path: string;
  /**
   * Optional Y-axis rotation in radians, for models whose GLB was authored
   * facing away from the camera. Only set this on cars that need it.
   */
  rotationY?: number;
}

// 7-day Car Schedule (Sunday = 0, Monday = 1, ..., Saturday = 6)
const CARS_BY_DAY: ScheduledCar[] = [
  {
    day: "Domingo",
    name: "Toyota Altezza SXE10 BDB",
    path: "/toyota_altezza_sxe10_bdb_-_gamerender_ready.glb",
  },
  {
    day: "Lunes",
    name: "1976 Volkswagen Golf GTI Mk1",
    path: "/1976_volkswagen_golf_gti_mk1.glb",
  },
  {
    day: "Martes",
    name: "1975 Porsche 911 930 Turbo",
    path: "/free_1975_porsche_911_930_turbo.glb",
  },
  {
    day: "Miércoles",
    name: "2019 Toyota Camry Hybrid XSE",
    path: "/2019_toyota_camry_hybrid_xse.glb",
  },
  {
    day: "Jueves",
    name: "2019 Ford Mustang Cobra Jet",
    path: "/2019_ford_mustang_cobra_jet.glb",
  },
  {
    day: "Viernes",
    name: "Vehicle Blue Train Bentley",
    path: "/vehicle_blue_train_bentley.glb",
    // This GLB is authored facing away from the camera; flip it 180°.
    rotationY: Math.PI,
  },
  {
    day: "Sábado",
    name: "1992 Jaguar XJ220",
    path: "/1992_jaguar_xj220.glb",
  },
];

export default function Home() {
  const [isLightsOn, setIsLightsOn] = useState(false);
  const [activeCarIndex, setActiveCarIndex] = useState(0);

  // Automatically select the car for today's day of the week
  useEffect(() => {
    const todayIndex = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    setActiveCarIndex(todayIndex);
  }, []);

  const currentCar = CARS_BY_DAY[activeCarIndex];
  const isDesktop = useSyncExternalStore(
    subscribeToDesktop,
    getIsDesktop,
    getIsDesktopOnServer
  );

  return (
    <main className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-12 select-none">
      {/* 3D Car Model Layer (On top of main content layer: z-30).
          Desktop only — not rendered at all on phones rather than hidden
          with CSS, so mobile skips the WebGL context and, more importantly,
          never downloads the .glb (these run from 2MB to 222MB). */}
      {isDesktop && (
        <div className="absolute inset-0 z-30 w-full h-full pointer-events-none flex items-center justify-center">
          <div className="w-full h-full">
            <CarCanvas
              modelPath={currentCar.path}
              lightsOn={isLightsOn}
              modelRotationY={currentCar.rotationY ?? 0}
            />
          </div>
        </div>
      )}

      {/* Header: Top Navigation Bar */}
      <Header />

      {/* Main 2-Column Content Structure */}
      <div className="relative z-20 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch pt-4 pb-2">
        {/* Column 1 (Left: 2 Rows -> Title on Top, Subtitle on Bottom) */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-between h-full py-2">
          {/* Row 1: Main Title */}
          <div className="mt-8 md:mt-12 mb-auto pt-2">
            {/* Base size is set in rem rather than text-6xl: "AUTODIAGNÓSTICO"
                is a single 15-character word that cannot wrap, and at 60px it
                overflowed the viewport on phones. Every sm:/md:/lg: step is
                unchanged, so desktop renders exactly as before. */}
            <h1 className="font-impact text-[3.2rem] sm:text-9xl md:text-9xl lg:text-[135px] uppercase text-white leading-[0.88] tracking-tight drop-shadow-2xl opacity-90">
              AUTODIAGNÓSTICO
              <br />
              PANJOS
            </h1>
          </div>

          {/* Row 2: Bottom Subtitle & Slider Indicator */}
          <div className="animate-component-left max-w-md w-full pt-4 pointer-events-auto">
            <h2 className="font-impact text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-wider mb-2">
              SERVICIO MECÁNICO MULTIMARCA
            </h2>
            <p className="font-yi-baiti text-xs sm:text-sm text-gray-400 leading-snug mb-3">
              Tenemos mas de una decada de experiencia en el mercado,
              en autodiagnostico panjos,
              brindamos un servicio de confianza y alta calidad
              para automotores de todas las marcas y modelos.
              Atención especializada y garantía en cada reparación.
              La confianza de nuestros clientes es nuestro mayor activo,
              ofrecemos atención rápida y personalizada. Ubicados en Palermo, Montevideo.
            </p>

            {/* Slider Progress Indicator with Arrow */}
            <div className="flex items-center space-x-3 w-75 sm:w-92">
              <div className="relative flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-all duration-300"
                  style={{ width: `${((activeCarIndex + 1) / 7) * 100}%` }}
                />
              </div>
              <div className="relative flex-1 h-[2px] bg-white rounded-full" />
              <svg
                onClick={() => setActiveCarIndex((prev) => (prev + 1) % 7)}
                className="w-6 h-6 text-white transform hover:translate-x-1 transition-transform cursor-pointer"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
                aria-label="Cambiar día"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Column 2 (Right: Note + Servicios Button + Red Container Box) */}
        <div className="md:col-span-5 lg:col-span-5 flex flex-col items-end justify-end h-full animate-component-right pb-2 md:-translate-y-2">
          {/* Note text above right box */}
          <p className="font-yi-baiti text-xs sm:text-sm text-gray-400 mb-2.5 text-center max-w-xs">
            Visita la seccion de servicios para conocer mas sobre lo que ofrecemos
          </p>

          {/* Servicios Bar - Triggers 3D Headlights on Hover */}
          <ArrowButton
            label="Servicios"
            href="/servicios"
            onMouseEnter={() => setIsLightsOn(true)}
            onMouseLeave={() => setIsLightsOn(false)}
            className="relative z-40 pointer-events-auto sm:w-72 md:w-80 mb-3"
          />

          {/* Red Container Box with image.avif */}
          <div className="red-container-box w-full sm:w-72 md:w-80 h-72 sm:h-72 md:h-[480px] relative">
            <Image
              src="/image.avif"
              alt="Autodiagnóstico Panjos"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
}
