"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Blob definitions. Each entry is one gradient "pool" of light.
 *
 * The liquid feel comes from three things layered on top of each other:
 *  1. `scrub` differs per blob — every pool lags behind the scroll by a
 *     different amount, so the layer never moves as one rigid sheet. This
 *     is what reads as viscosity.
 *  2. Each blob drifts on its own idle loop (independent of scroll), so the
 *     background is alive even when the page is still.
 *  3. `mix-blend-mode: screen` + heavy blur makes overlapping pools merge
 *     into each other like light through liquid instead of stacking as
 *     discrete circles.
 */
const BLOBS = [
  {
    // Monochrome only — pure white at low alpha over a near-black page
    // reads as a grey/black tone with no hue at all. Alpha is the only
    // thing that varies, so the field stays strictly black-and-grey.
    color: "rgba(255, 255, 255, 0.07)",
    size: 52,
    left: -8,
    top: -8,
    scrollY: -125,
    scrollX: 48,
    scrollScale: 1.7,
    scrollRotate: 65,
    scrub: 0.35,
    drift: { x: 6, y: -5, duration: 13 },
  },
  {
    color: "rgba(255, 255, 255, 0.05)",
    size: 44,
    left: 58,
    top: 4,
    scrollY: 140,
    scrollX: -55,
    scrollScale: 0.55,
    scrollRotate: -80,
    scrub: 0.9,
    drift: { x: -7, y: 6, duration: 17 },
  },
  {
    color: "rgba(255, 255, 255, 0.08)",
    size: 60,
    left: 15,
    top: 40,
    scrollY: -160,
    scrollX: -40,
    scrollScale: 1.45,
    scrollRotate: 50,
    scrub: 0.25,
    drift: { x: 5, y: 7, duration: 11 },
  },
  {
    color: "rgba(255, 255, 255, 0.04)",
    size: 38,
    left: 70,
    top: 52,
    scrollY: -105,
    scrollX: 70,
    scrollScale: 1.9,
    scrollRotate: -95,
    scrub: 0.7,
    drift: { x: -6, y: -8, duration: 15 },
  },
  {
    color: "rgba(255, 255, 255, 0.06)",
    size: 48,
    left: -6,
    top: 68,
    scrollY: 130,
    scrollX: 52,
    scrollScale: 0.62,
    scrollRotate: 75,
    scrub: 1.1,
    drift: { x: 8, y: -6, duration: 19 },
  },
  {
    color: "rgba(255, 255, 255, 0.045)",
    size: 42,
    left: 40,
    top: 86,
    scrollY: -150,
    scrollX: -62,
    scrollScale: 1.6,
    scrollRotate: -60,
    scrub: 0.5,
    drift: { x: -5, y: 6, duration: 14 },
  },
] as const;

/**
 * Full-viewport animated gradient field that flows with scroll.
 *
 * Renders `fixed inset-0` behind the page content, so it stays put while the
 * document scrolls past it and the motion below is the only thing moving.
 * Purely decorative: `aria-hidden` + `pointer-events-none`.
 *
 * Note for the host page: this sits at `z-0`, so any content that should
 * appear above it needs to establish a stacking context above that (e.g.
 * `relative z-10`). Opaque section backgrounds will hide it entirely.
 */
export default function LiquidBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const layer = layerRef.current;
      if (!layer) return;

      const mm = gsap.matchMedia();

      // Everything below is motion, so it's gated entirely on the user not
      // having asked for reduced motion. Under `reduce` this block simply
      // never runs: the gradients still render (and still look richer than
      // before, which is a static change), they just hold still.
      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          BLOBS.forEach((blob, i) => {
            const wrap = wrapRefs.current[i];
            const inner = innerRefs.current[i];
            if (!wrap || !inner) return;

            // --- Scroll-driven flow -------------------------------------
            // Attached to the wrapper. Per the gsap-scrolltrigger skill,
            // the ScrollTrigger lives on this top-level tween, never on a
            // child of a timeline.
            gsap.to(wrap, {
              yPercent: blob.scrollY,
              xPercent: blob.scrollX,
              scale: blob.scrollScale,
              rotate: blob.scrollRotate,
              ease: "none",
              scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                // Distinct per blob: the pools drift out of sync with the
                // scroll and with each other, which is what sells "liquid"
                // rather than "parallax layers".
                scrub: blob.scrub,
              },
            });

            // --- Idle drift ---------------------------------------------
            // On the INNER element so it never fights the scroll tween
            // above for the same properties.
            gsap.to(inner, {
              xPercent: blob.drift.x,
              yPercent: blob.drift.y,
              duration: blob.drift.duration,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });

            // Independent squash/stretch loop — a blob that only translates
            // reads as a solid disc; one that also deforms reads as fluid.
            gsap.to(inner, {
              scaleX: 1.18,
              scaleY: 0.86,
              duration: blob.drift.duration * 0.7,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          });

          // --- Scroll-velocity reaction ---------------------------------
          // Real liquid deforms when its container accelerates. Stretch and
          // shear the whole field in proportion to scroll velocity, then
          // ease back to rest. quickTo avoids allocating a tween per frame.
          const setScaleY = gsap.quickTo(layer, "scaleY", {
            duration: 0.7,
            ease: "power3.out",
          });
          const setSkewY = gsap.quickTo(layer, "skewY", {
            duration: 0.7,
            ease: "power3.out",
          });

          const velocityTrigger = ScrollTrigger.create({
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              // Lower divisor = reaches full deformation at a slower flick,
              // so normal scrolling (not just a violent fling) visibly
              // sloshes the field.
              const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 1200);
              setScaleY(1 + Math.abs(v) * 0.3);
              setSkewY(v * 7);
            },
          });

          return () => {
            velocityTrigger.kill();
          };
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        ref={layerRef}
        // Inset negatively so blobs can move well past the viewport edges
        // without ever revealing a hard boundary.
        className="absolute -inset-[35%] will-change-transform"
        // Less blur than a typical "ambient glow" background: at 70px+ the
        // pools were so diffuse that even large travel barely changed what
        // you actually see. Tighter blur keeps them soft but legible, so the
        // motion registers.
        style={{ filter: "blur(50px)" }}
      >
        {BLOBS.map((blob, i) => (
          <div
            key={i}
            ref={(el) => {
              wrapRefs.current[i] = el;
            }}
            className="absolute will-change-transform"
            style={{
              left: `${blob.left}%`,
              top: `${blob.top}%`,
              width: `${blob.size}vw`,
              height: `${blob.size}vw`,
            }}
          >
            <div
              ref={(el) => {
                innerRefs.current[i] = el;
              }}
              className="h-full w-full will-change-transform"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${blob.color} 0%, transparent 68%)`,
                // Pools of light add together instead of occluding each
                // other — essential for the "merging liquid" look on a
                // near-black page.
                mixBlendMode: "screen",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
