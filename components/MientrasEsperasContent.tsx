"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import Header from "@/components/Header";
import LiquidBackground from "@/components/LiquidBackground";
import ArrowButton from "@/components/ArrowButton";
import { address, whatsappNumber } from "@/lib/site";
import {
  COAST,
  DIECIOCHO,
  ISLA_DE_FLORES,
  LAKE,
  MAP_H,
  MAP_W,
  PARK,
  PINS,
  RAMBLA,
  ROUTES,
  STREETS,
  WATER,
} from "@/lib/barrio-map";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, SplitText, useGSAP);

const WA_DIGITS = whatsappNumber.replace(/\D/g, "");

type Stop = {
  name: string;
  distance: string;
  text: string;
  pin: readonly [number, number];
  /** Walking route that leads to this stop from the previous one. */
  segment: string | null;
};

/**
 * The walk, in order. Each stop owns the route segment that leads *to* it,
 * so scrolling a stop into view draws exactly the stretch of street the
 * visitor would walk to get there.
 *
 * Pins and routes come from lib/barrio-map.ts: real OpenStreetMap geometry,
 * routed along real streets. Walking times are those route lengths
 * (METERS) at an easy ~80 m/min, rounded.
 */
const STOPS: Stop[] = [
  {
    name: "Isla de Flores",
    distance: "Estás acá",
    text: "La calle del taller es también la calle del candombe: por acá pasa cada febrero el Desfile de Llamadas. Si un fin de semana escuchas tambores, es una cuerda ensayando.",
    pin: PINS.taller,
    segment: null,
  },
  {
    name: "La Rambla",
    distance: "Unos 7 min a pie",
    text: "La costanera de Montevideo corre kilómetros junto al Río de la Plata. Para caminar, sentarse frente al agua con un mate o esperar el atardecer.",
    pin: PINS.rambla,
    segment: ROUTES.rambla,
  },
  {
    name: "Bar Tinkal",
    distance: "De pasada, a unos 12 min",
    text: "Uno de los templos del chivito en Montevideo, en Frugoni y Luis Piera. Si te agarra el hambre camino al parque, es parada obligada.",
    pin: PINS.tinkal,
    segment: ROUTES.tinkal,
  },
  {
    name: "Playa Ramírez",
    distance: "Unos 20 min a pie",
    text: "La playa del Parque Rodó, la más cercana al centro. En verano se llena; fuera de temporada es un lugar tranquilo para caminar por la arena.",
    pin: PINS.playa,
    segment: ROUTES.playa,
  },
  {
    name: "Parque Rodó",
    distance: "Unos 30 min a pie",
    text: "Lago, arboledas, el Castillito con su biblioteca infantil y juegos para los más chicos. Un buen lugar para pasar una hora sin mirar el reloj.",
    pin: PINS.lago,
    segment: ROUTES.lago,
  },
  {
    name: "Museo Nacional de Artes Visuales",
    distance: "Cruzando el parque",
    text: "La colección de arte uruguayo más importante del país, con obras de Blanes, Figari y Torres García.",
    pin: PINS.mnav,
    segment: ROUTES.mnav,
  },
];

/** Off the main walk, in the opposite direction — drawn thinner and white. */
const DETOUR: Stop = {
  name: "Mirador de la Intendencia",
  distance: "Hacia el otro lado, unos 15 min",
  text: "Sobre 18 de Julio, el Palacio Municipal tiene un mirador en lo alto con vista a toda la ciudad, la bahía y el Cerro.",
  pin: PINS.intendencia,
  segment: ROUTES.intendencia,
};

export default function MientrasEsperasContent() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef);
      const stopEls = q<HTMLElement>(".me-stop");

      // Highlighting the current stop and its pin is a state change, not
      // motion, so it runs for everyone — including reduced-motion users.
      stopEls.forEach((stop, i) => {
        ScrollTrigger.create({
          trigger: stop,
          start: "top 60%",
          end: "bottom 60%",
          toggleClass: { targets: [stop, ...q(`.me-pin-${i}`)], className: "is-active" },
        });
      });

      const mm = gsap.matchMedia();

      // Single-query string form: with a conditions object gsap.matchMedia
      // only runs when some query matches (see NotFoundContent).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ---- Page load: the one orchestrated entrance ----
        SplitText.create(".me-title", {
          type: "words",
          mask: "words",
          // Re-split once Anton swaps in, so line breaks match the real font.
          autoSplit: true,
          onSplit: (self) => {
            // The title's tight leading (0.84) is shorter than Anton's
            // glyphs, so a bare mask crops the bottom of every letter. Pad
            // the masks and pull the padding back with negative margins so
            // the lines keep their spacing.
            gsap.set(self.masks, { padding: "0.1em 0.04em 0.14em", margin: "-0.1em -0.04em -0.14em" });
            return gsap.from(self.words, {
              // Past 100% because the padded mask would otherwise show the
              // tops of the letters before they start rising.
              yPercent: 150,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.09,
            });
          },
        });
        gsap.from(".me-intro", { autoAlpha: 0, y: 16, duration: 0.9, delay: 0.5, ease: "power3.out" });

        // ---- The walk: each stop draws its own stretch of route ----
        const dot = q(".me-walker")[0];
        stopEls.forEach((stop, i) => {
          const seg = rootRef.current?.querySelector<SVGPathElement>(`.me-seg-${i}`);
          if (!seg) return;
          const isDetour = stop.dataset.detour === "true";

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stop,
              start: "top 85%",
              end: "top 45%",
              scrub: 0.6,
            },
          });
          tl.fromTo(seg, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" });
          // The walker rides the tip of the line. Consecutive segments share
          // endpoints, so scrubbing back and forth never makes it jump. The
          // detour leaves from the taller, so the walker sits that one out.
          if (!isDetour && dot) {
            tl.to(
              dot,
              {
                motionPath: { path: seg, align: seg, alignOrigin: [0.5, 0.5] },
                ease: "none",
              },
              0
            );
          }
        });

        // The river breathes: hairlines drift slowly, independent of scroll.
        gsap.to(".me-water-lines", { x: -24, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
    },
    { scope: rootRef }
  );

  const allStops = [...STOPS, DETOUR];

  return (
    <div
      ref={rootRef}
      className="relative w-full min-h-screen bg-[#060606] text-white overflow-x-clip"
    >
      <LiquidBackground />
      <Header />

      {/* ---- Hero ---- */}
      <section className="relative z-10 w-full min-h-[88svh] flex flex-col justify-end pt-28 pb-14 px-6 sm:px-10 md:px-12">
        <h1 className="me-title font-impact text-[17vw] sm:text-[15vw] md:text-[150px] lg:text-[190px] xl:text-[220px] uppercase text-white leading-[0.84] tracking-tighter drop-shadow-2xl max-w-[12ch]">
          ¿Y mientras tanto?
        </h1>
        <div className="me-intro mt-8 md:mt-10 grid md:grid-cols-12 gap-6">
          <p className="md:col-span-6 lg:col-span-5 font-yi-baiti text-base sm:text-lg text-gray-300 leading-relaxed max-w-[46ch]">
            Tu auto queda en buenas manos en {address.street}. Tú tienes un rato
            libre en Palermo, entre la Rambla y el Parque Rodó. Esto es lo que
            hay cerca, en el orden en que lo encontrarías caminando.
          </p>
          <div className="md:col-span-6 lg:col-span-7 flex md:justify-end items-end">
            <div className="flex items-center gap-3 text-gray-500 font-yi-baiti text-sm">
              <span>Baja para ver el recorrido</span>
              <span className="relative block w-px h-10 bg-white/15 overflow-hidden">
                <span className="me-scroll-cue absolute left-0 top-0 w-px h-4 bg-red-500" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The walk ---- */}
      <section className="relative z-10 w-full px-6 sm:px-10 md:px-12">
        <div className="md:grid md:grid-cols-12 md:gap-10">
          {/* Map. Sticky on every width: on phones it docks at the top and
              the stops scroll underneath it. */}
          <div className="sticky top-0 z-20 md:order-2 md:col-span-7 h-[46svh] md:h-screen flex items-center justify-center bg-gradient-to-b from-[#060606] from-85% to-transparent md:bg-none -mx-6 px-6 sm:-mx-10 sm:px-10 md:mx-0 md:px-0">
            <figure className="relative w-full h-full md:h-auto md:max-h-[88vh] flex flex-col items-center justify-center">
              <NeighbourhoodMap stops={allStops} />
              <figcaption className="font-yi-baiti text-[11px] text-gray-500 mt-1 md:mt-3 self-end">
                Tiempos aproximados a pie. Mapa © colaboradores de OpenStreetMap.
              </figcaption>
            </figure>
          </div>

          <ol className="relative md:order-1 md:col-span-5 pt-6 md:pt-[30vh] pb-[20vh]">
            {allStops.map((stop, i) => {
              const isDetour = stop === DETOUR;
              return (
                <li
                  key={stop.name}
                  data-detour={isDetour}
                  className={`me-stop group/stop min-h-[58svh] md:min-h-[72vh] flex gap-5 sm:gap-7 ${isDetour ? "mt-[10vh] pt-10 border-t border-white/10" : ""}`}
                >
                  <span
                    aria-hidden="true"
                    className="me-stop-mark font-impact text-3xl sm:text-4xl leading-none w-10 flex-shrink-0 pt-1"
                  >
                    {isDetour ? "+" : i + 1}
                  </span>
                  <div className="max-w-[42ch]">
                    <p className="font-yi-baiti text-sm text-red-400">
                      {stop.distance}
                    </p>
                    <h2 className="font-impact text-4xl sm:text-5xl lg:text-6xl uppercase leading-[0.9] tracking-tight mt-2">
                      {stop.name}
                    </h2>
                    <p className="font-yi-baiti text-base sm:text-lg text-gray-300 leading-relaxed mt-4">
                      {stop.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---- Back to the car ---- */}
      <section className="pb-mobile-cta relative z-10 w-full px-6 sm:px-10 md:px-12 pt-10 pb-20 md:pb-28">
        <div className="max-w-3xl">
          <h2 className="font-impact text-6xl sm:text-8xl md:text-[110px] uppercase leading-[0.85] tracking-tighter">
            Tu auto te espera en Isla de Flores
          </h2>
          <p className="font-yi-baiti text-base sm:text-lg text-gray-300 leading-relaxed mt-6 max-w-[48ch]">
            ¿Quieres saber cómo va? Escríbenos y te contamos en qué etapa está.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <a
              href={`https://wa.me/${WA_DIGITS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 border border-red-500/60 flex items-center justify-center gap-3 font-yi-baiti text-base font-semibold transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A3 3 0 0 0 7 10a5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.9.7 1.9.5 2.3.5a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
              </svg>
              Preguntar por mi auto
            </a>
            <ArrowButton label="Volver al inicio" href="/" className="flex-1 !py-3" />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Map of the barrio, north up, drawn from real OpenStreetMap geometry (see
 * scripts/barrio-map.py). Streets are a quiet web, the named ones a step
 * brighter; the only saturated colour is the walked route.
 */
function NeighbourhoodMap({ stops }: { stops: readonly Stop[] }) {
  const detourIndex = stops.length - 1;

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="w-full h-full md:h-auto max-h-full"
      role="img"
      aria-label="Mapa del recorrido a pie desde el taller en Isla de Flores hasta la Rambla, el Bar Tinkal, Playa Ramírez, el Parque Rodó y el museo, con un desvío al mirador de la Intendencia"
    >
      <defs>
        <pattern id="me-water" width="600" height="7" patternUnits="userSpaceOnUse">
          <line x1="0" y1="3.5" x2="600" y2="3.5" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
        </pattern>
        <pattern id="me-park" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="rgba(255,255,255,0.18)" />
        </pattern>
        <clipPath id="me-water-clip">
          <path d={WATER} />
        </clipPath>
      </defs>

      {/* Parque Rodó and its lake */}
      <path d={PARK} fill="url(#me-park)" stroke="rgba(255,255,255,0.16)" />
      <path d={LAKE} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" />

      {/* Street web, then the named streets a step brighter */}
      <path d={STREETS} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
      <path d={`${ISLA_DE_FLORES} ${DIECIOCHO}`} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />

      {/* River: covers any street drawn past the shore, then hairlines clipped
          to the real coastline, drifting slowly */}
      <path d={WATER} fill="#060606" />
      <g clipPath="url(#me-water-clip)">
        <rect className="me-water-lines" x="-40" y="0" width={MAP_W + 80} height={MAP_H + 40} fill="url(#me-water)" />
      </g>
      <path d={COAST} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <path d={RAMBLA} fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Labels, hand-placed on top of the real geometry */}
      <g className="font-yi-baiti" fill="rgba(255,255,255,0.5)" fontSize="10" letterSpacing="1.6">
        {MAP_LABELS.map(({ text, x, y, rotate }) => (
          <text key={text} x={x} y={y} transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
            {text}
          </text>
        ))}
        <text x={RIVER_LABEL.x} y={RIVER_LABEL.y} fontStyle="italic" fill="rgba(255,255,255,0.3)" letterSpacing="5">
          RÍO DE LA PLATA
        </text>
      </g>

      {/* North */}
      <g transform={`translate(${MAP_W - 22} 26)`} fill="rgba(255,255,255,0.5)">
        <path d="M0,-12 L5,4 L0,0 L-5,4 Z" />
        <text y="17" textAnchor="middle" fontSize="9" className="font-yi-baiti">N</text>
      </g>

      {/* Route segments. Rendered fully drawn so the map is complete without
          JS; GSAP resets them to 0% and draws them on scroll. */}
      {stops.map((stop, i) =>
        stop.segment ? (
          <path
            key={`seg-${stop.name}`}
            className={`me-seg-${i}`}
            d={stop.segment}
            fill="none"
            stroke={i === detourIndex ? "rgba(255,255,255,0.8)" : "#dc2626"}
            strokeWidth={i === detourIndex ? 2 : 3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null
      )}

      {/* The walker: rides the tip of the route while it draws.
          Painted under the pins so it slips beneath each number on arrival. */}
      <g className="me-walker" transform={`translate(${PINS.taller[0]} ${PINS.taller[1]})`}>
        <circle r="4.5" fill="#fff" stroke="#dc2626" strokeWidth="2" />
      </g>

      {/* Pins */}
      {stops.map((stop, i) => (
        <g
          key={`pin-${stop.name}`}
          className={`me-pin me-pin-${i} ${i === detourIndex ? "me-pin-detour" : ""}`}
          transform={`translate(${stop.pin[0]} ${stop.pin[1]})`}
        >
          <circle className="me-pin-halo" r="15" />
          <circle className="me-pin-dot" r="9" />
          <text className="me-pin-num font-impact" textAnchor="middle" dy="4" fontSize="11">
            {i === detourIndex ? "+" : i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Street labels, placed by eye along the real streets. */
const MAP_LABELS = [
  { text: "18 DE JULIO", x: 120, y: 60, rotate: -8 },
  { text: "ISLA DE FLORES", x: 262, y: 170, rotate: -6 },
  { text: "RAMBLA", x: 120, y: 270, rotate: 10 },
  { text: "PARQUE RODÓ", x: 440, y: 300, rotate: 0 },
];
const RIVER_LABEL = { x: 60, y: 420 };
