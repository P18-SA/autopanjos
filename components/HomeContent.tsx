"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

import Header from "@/components/Header";
import ArrowButton from "@/components/ArrowButton";
import { CMS_URL } from "@/lib/cms";
import { useModelUrl } from "@/lib/useModelUrl";

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

/**
 * A car in the weekly rotation.
 *
 * The model comes from exactly one of two places, and the union makes it
 * impossible to set both or neither:
 *
 *   - `entryUrl` — the normal case. A cemapi entry; the bucket URL is resolved
 *     the first time that car is shown. Swapping the file in the CMS panel
 *     changes the car here with no deploy.
 *   - `path` — a file in `/public`, for models the CMS can't hold. The bucket
 *     rejects anything over 50MB (the Supabase project's global cap), and the
 *     Porsche is 74MB.
 */
type ScheduledCar = {
  day: string;
  name: string;
  /**
   * Optional Y-axis rotation in radians, for models whose GLB was authored
   * facing away from the camera. Only set this on cars that need it.
   */
  rotationY?: number;
} & ({ entryUrl: string; path?: never } | { path: string; entryUrl?: never });

/** Base of this site's content in the CMS. */
const CMS_ENTRIES = `${CMS_URL}/api/jotalsoftdevs/entries/modelos`;

// 7-day Car Schedule (Sunday = 0, Monday = 1, ..., Saturday = 6)
//
// Which car belongs to which day is decided in the CMS, not here: each entry
// is named after its day, and this list points at them in day order. The
// `name` is only the on-screen label — the model itself always comes from
// whatever file that entry currently holds.
const CARS_BY_DAY: ScheduledCar[] = [
  {
    day: "Domingo",
    name: "1975 Porsche 911 930 Turbo",
    // Stays local: 74MB, and the bucket rejects anything over 50MB.
    path: "/free_1975_porsche_911_930_turbo.glb",
  },
  {
    day: "Lunes",
    name: "1992 Jaguar XJ220",
    entryUrl: `${CMS_ENTRIES}/0592006a-d11e-4d99-8faf-2a8539364797`,
  },
  {
    day: "Martes",
    name: "1976 Volkswagen Golf GTI Mk1",
    entryUrl: `${CMS_ENTRIES}/e4b8f968-ca07-4bce-bf02-034998617cce`,
  },
  {
    day: "Miércoles",
    name: "2019 Ford Mustang Cobra Jet",
    entryUrl: `${CMS_ENTRIES}/cc4d4ccb-0972-463c-83d7-cd97d00d942b`,
  },
  {
    day: "Jueves",
    name: "Toyota Altezza SXE10 BDB",
    entryUrl: `${CMS_ENTRIES}/b34b6855-6d8c-4ae2-92c7-1d76a9249ae5`,
  },
  {
    day: "Viernes",
    name: "2019 Toyota Camry Hybrid XSE",
    entryUrl: `${CMS_ENTRIES}/862ec911-78b8-463d-9da6-9e3cedef78b4`,
  },
  {
    day: "Sábado",
    name: "Vehicle Blue Train Bentley",
    entryUrl: `${CMS_ENTRIES}/d2c6d265-cd82-4278-a920-853ae3d15e16`,
    // This GLB is authored facing away from the camera; flip it 180°.
    rotationY: Math.PI,
  },
];

type Props = {
  /** Copy ya resuelta en el servidor: llega en el HTML, no se pide del browser. */
  content: {
    h1: string;
    h2: string;
    text: string;
    image: { src: string; alt: string };
  };
};

export default function HomeContent({ content }: Props) {
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

  // Only the car on screen gets resolved, and only once per page load.
  const model = useModelUrl(currentCar);

  // `h-screen overflow-hidden` is kept for `md:` and up, where the 3D car
  // needs a fixed, non-scrolling stage. On a phone there is no car (see
  // `isDesktop` above) and the right-hand column — note, Servicios button,
  // photo — adds up to more than a short viewport can hold, so forcing it all
  // into one clipped screen cut the photo off. Below `md:` the page is
  // therefore allowed to grow and scroll normally; together with
  // `pb-mobile-cta` that guarantees the fixed call bar never covers anything.
  // Horizontal clipping is kept on both sides of the breakpoint, though: the
  // right-hand column enters with `animate-component-right`, whose first
  // keyframe is `translateX(50px)`, and without `overflow-x-hidden` that
  // overshoot briefly widens the page on a phone.
  return (
    <main className="pb-mobile-cta relative w-full min-h-screen overflow-x-hidden md:h-screen md:overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-12 select-none">
      {/* 3D Car Model Layer (On top of main content layer: z-30).
          Desktop only — not rendered at all on phones rather than hidden
          with CSS, so mobile skips the WebGL context and, more importantly,
          never downloads the .glb (these run from 2MB to 222MB). */}
      {isDesktop && (
        <div className="absolute inset-0 z-30 w-full h-full pointer-events-none flex items-center justify-center">
          <div className="w-full h-full">
            {/* The canvas mounts only once there is a URL. Handing CarCanvas
                an empty path would send GLTFLoader at its built-in default,
                which is not a file this project ships. */}
            {model.url ? (
              <CarCanvas
                modelPath={model.url}
                lightsOn={isLightsOn}
                modelRotationY={currentCar.rotationY ?? 0}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/40 font-yi-baiti text-base animate-pulse">
                {model.loading ? "Cargando 3D..." : "No se pudo cargar el modelo"}
              </div>
            )}
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
            {/* "AUTODIAGNÓSTICO" is a single 15-character word that cannot
                wrap, so its size on a phone is bounded by the viewport, not
                by taste. The old flat 3.2rem was hand-fitted to Impact; Anton
                sets ~6.2em wide for that word rather than Impact's ~5.9em, so
                the same value now overflows a 375px screen (and badly on a
                320px one). `min()` keeps 3.2rem as the ceiling and otherwise
                derives the size from the space actually available —
                100vw minus the 3rem of `p-6` padding, divided by that 6.2em
                ratio with a couple of percent to spare. (The underscores are
                Tailwind's escape for the spaces `calc()` requires around
                its `-`; without them the whole declaration is invalid.) From `sm:` up
                `sm:text-9xl` takes over, so every larger breakpoint is
                exactly as before. */}
            <h1 className="font-impact text-[min(3.2rem,calc(15.8vw_-_7.6px))] sm:text-9xl md:text-9xl lg:text-[135px] uppercase text-white leading-[0.88] tracking-tight drop-shadow-2xl opacity-90">
              {content.h1}
            </h1>
          </div>

          {/* Row 2: Bottom Subtitle & Slider Indicator */}
          <div className="animate-component-left max-w-md w-full pt-4 pointer-events-auto">
            <h2 className="font-impact text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-wider mb-2">
              {content.h2}
            </h2>

            <p className="font-yi-baiti text-xs sm:text-sm text-gray-400 leading-snug mb-3">
              {content.text}
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
              src={content.image.src}
              alt={content.image.alt}
              title="Taller Autodiagnóstico Panjos en Palermo, Montevideo"
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
}
