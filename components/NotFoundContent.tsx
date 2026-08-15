"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

import Header from "@/components/Header";
import LiquidBackground from "@/components/LiquidBackground";
import ArrowButton from "@/components/ArrowButton";

gsap.registerPlugin(ScrambleTextPlugin, useGSAP);

const HEADING_WORDS = ["PÁGINA", "NO", "ENCONTRADA"];

/**
 * Custom 404.
 *
 * Reuses the site's existing furniture — Header, LiquidBackground, the shared
 * ArrowButton, font-impact headings on #060606 with red accents — so it reads
 * as part of the same site rather than a framework default.
 *
 * Animation is GSAP only (no Three.js): the page already gets ambient motion
 * from LiquidBackground, and a WebGL context plus a model download would be a
 * poor trade on an error page that should render instantly.
 */
export default function NotFoundContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const code = codeRef.current;
      if (!code) return;

      const mm = gsap.matchMedia();

      // Single-query string form on purpose. With a conditions *object*,
      // gsap.matchMedia only runs the callback when at least one query
      // matches (`active && func(...)` in gsap-core) — the trap that
      // silently killed the animations on /servicios.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ---- Entrance ----
        const intro = gsap.timeline();

        // Scramble settles on "404" like a signal locking in.
        intro.to(code, {
          duration: 1.4,
          scrambleText: {
            text: "404",
            chars: "01!<>-_\\/[]{}=+*^?#",
            speed: 0.7,
            revealDelay: 0.25,
          },
          ease: "none",
        });

        intro.from(
          ".nf-word",
          {
            yPercent: 110,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.07,
          },
          0.35
        );

        intro.from(
          ".nf-fade",
          { y: 20, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 },
          0.6
        );

        // ---- Recurring glitch ----
        // Kicks the red ghost sideways for a few frames, then snaps back.
        const glitch = gsap
          .timeline({ repeat: -1, repeatDelay: 3.2, delay: 2 })
          .to(code, { "--glitch-x": "10px", duration: 0.05 })
          .to(code, { "--glitch-x": "-7px", duration: 0.05 })
          .to(code, { "--glitch-x": "3px", duration: 0.05 })
          .to(code, { "--glitch-x": "0px", duration: 0.05 })
          // Occasionally re-scramble so the number itself looks unstable,
          // not just its shadow.
          .to(
            code,
            {
              duration: 0.5,
              scrambleText: { text: "404", chars: "01!<>-_/", speed: 1 },
              ease: "none",
            },
            "<"
          );

        return () => {
          intro.kill();
          glitch.kill();
        };
      });

      // Reduced motion: no scramble runs, so write the final text in
      // directly — otherwise the element would sit there empty.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        code.textContent = "404";
      });
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="relative w-full min-h-screen bg-[#060606] text-white overflow-x-hidden select-none"
    >
      <LiquidBackground />
      <Header />

      <section className="relative z-10 w-full min-h-screen flex flex-col justify-center pt-24 sm:pt-28 pb-12 px-6 sm:px-10 md:px-12">
        <div className="max-w-3xl">
          {/* The big 404 is decorative: the <h1> below carries the meaning,
              and the scrambling characters would be nonsense to a screen
              reader mid-animation. */}
          <span
            ref={codeRef}
            aria-hidden="true"
            className="glitch-text font-impact block text-[5.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[15rem] leading-[0.82] tracking-tighter text-white drop-shadow-2xl"
          />

          <h1 className="font-impact text-[2.1rem] sm:text-5xl md:text-6xl lg:text-7xl uppercase text-white leading-[0.9] tracking-tight mt-4 sm:mt-6">
            {HEADING_WORDS.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom">
                <span className="nf-word inline-block will-change-transform">
                  {word}
                  {i < HEADING_WORDS.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h1>

          <p className="nf-fade font-yi-baiti text-sm sm:text-base text-gray-400 leading-snug mt-5 max-w-md">
            La dirección que buscás no existe o cambió de lugar. Podés volver al
            inicio, ver los servicios del taller o escribirnos directamente.
          </p>

          <div className="nf-fade mt-7 w-full sm:w-80">
            <ArrowButton label="Volver al inicio" href="/" />
          </div>

          <nav
            aria-label="Enlaces útiles"
            className="nf-fade flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 font-yi-baiti text-sm"
          >
            <Link
              href="/servicios"
              className="text-gray-400 hover:text-red-400 transition-colors underline underline-offset-4"
            >
              Servicios
            </Link>
            <Link
              href="/nosotros"
              className="text-gray-400 hover:text-red-400 transition-colors underline underline-offset-4"
            >
              Sobre nosotros
            </Link>
            <Link
              href="/contacto"
              className="text-gray-400 hover:text-red-400 transition-colors underline underline-offset-4"
            >
              Contacto
            </Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
