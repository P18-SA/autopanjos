"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ServiceCard, { ServiceCardProps } from "@/components/ServiceCard";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface ServiceCardsStackProps {
  services: ServiceCardProps[];
}

const EASE_IN = "power3.out";
const EASE_HOLD = "power2.inOut";

/**
 * Scroll-storytelling stack (Apple product-page style), driven by GSAP
 * ScrollTrigger. Every ScrollTrigger below is attached via the `scrollTrigger`
 * property directly on its owning timeline (the documented pattern), never
 * passed in externally — see gsap-scrolltrigger skill, "Do Not" #1.
 *
 * Per panel (when motion is not reduced), two triggers:
 *  1. ENTRANCE — scrubbed to the panel's own natural (un-pinned) scroll
 *     motion as it slides up from below the viewport. Reveals the number,
 *     title (word stagger), description, bullets and image wipe.
 *  2. PIN + GHOST EXIT — `pin: true, pinSpacing: false` fixes the panel at
 *     the top of the viewport for exactly one more viewport of scroll: the
 *     same distance the *next* panel needs (in normal flow, un-pinned) to
 *     slide up and cover it. `pinSpacing: false` is what lets that next
 *     panel occupy the same screen space instead of GSAP reserving extra
 *     document height for the pin — the classic "stacked pin" recipe. While
 *     that happens, this panel's content recedes into a dim, oversized
 *     "ghost" layer behind the incoming one.
 *
 * `prefers-reduced-motion` swaps all of the above for a minimal, non-pinned,
 * non-scrubbed opacity fade per panel — normal document scroll throughout.
 */
export default function ServiceCardsStack({ services }: ServiceCardsStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorVisible, setIndicatorVisible] = useState(false);

  useGSAP(
    () => {
      const panels = panelRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      if (panels.length === 0) return;

      const mm = gsap.matchMedia();

      // `isMobile` is not used below — it exists so that at least one query
      // always matches. gsap.matchMedia only invokes the callback when a
      // condition is active (`active && func(...)` in gsap-core): with just
      // `isDesktop` + `reduceMotion`, a phone with no reduced-motion
      // preference matched neither, so this whole block never ran. That
      // silently disabled every animation on mobile AND left each card's
      // `.sc-image-overlay` covering its image, which looked like the images
      // were failing to load.
      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          if (!reduceMotion) {
            // Toggles the side progress indicator on/off while the stack is in
            // view, AND derives which dot is lit.
            //
            // The dot used to be driven by each panel's own pin trigger
            // (onEnter: setActiveIndex(i)). That was off by one: panel i's pin
            // starts at "top top" and ends at "bottom top", and during that
            // whole range panel i+1 is sliding up and covering it — so by the
            // time panel i+1 filled the screen, the indicator still read i.
            // Worse, the last panel's start sits at the very end of the
            // scrollable range, so its dot never lit at all.
            //
            // Instead, derive the index from the container's own progress.
            // With `pinSpacing: false` the pins add no document height, so the
            // panels stay a uniform 100vh each and progress maps linearly onto
            // them: panel i fully covers the screen at progress i/(n-1).
            // Rounding switches the dot at the halfway point of each
            // transition — when the incoming panel covers half the viewport,
            // which is when it reads as "the current card".
            let lastIndex = -1;
            ScrollTrigger.create({
              trigger: containerRef.current,
              start: "top top",
              end: "bottom bottom",
              onToggle: (self) => setIndicatorVisible(self.isActive),
              onUpdate: (self) => {
                const idx = Math.round(self.progress * (panels.length - 1));
                if (idx !== lastIndex) {
                  lastIndex = idx;
                  setActiveIndex(idx);
                }
              },
            });
          }

          panels.forEach((panel, i) => {
            const q = gsap.utils.selector(panel);
            const titleWords = q(".sc-title-word");
            const number = q(".sc-number");
            const description = q(".sc-description");
            const subheading = q(".sc-subheading");
            const bullets = q(".sc-bullet");
            const image = q(".sc-image");
            const overlay = q(".sc-image-overlay");
            const content = q(".sc-content");

            if (reduceMotion) {
              // Accessible fallback: no pin, no scrub, no parallax — just a
              // simple opacity crossfade as each panel reaches the viewport.
              gsap.set(overlay, { autoAlpha: 0 });
              gsap.from(content, {
                autoAlpha: 0,
                duration: 0.6,
                ease: "power1.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 75%",
                  toggleActions: "play none none reverse",
                },
              });
              return;
            }

            // ---- Entrance ----
            gsap
              .timeline({
                scrollTrigger: { trigger: panel, start: "top bottom", end: "top top", scrub: 0.4 },
              })
              .fromTo(overlay, { yPercent: 0 }, { yPercent: -100, ease: EASE_IN, duration: 1 }, 0)
              .fromTo(image, { scale: 1.12 }, { scale: 1, ease: EASE_IN, duration: 1 }, 0)
              .fromTo(number, { y: 50, opacity: 0 }, { y: 0, opacity: 0.95, ease: EASE_IN, duration: 0.8 }, 0.05)
              .fromTo(
                titleWords,
                { y: "110%", opacity: 0 },
                { y: "0%", opacity: 1, ease: EASE_IN, duration: 0.8, stagger: isDesktop ? 0.07 : 0.04 },
                0.05
              )
              .fromTo(description, { y: 24, opacity: 0 }, { y: 0, opacity: 1, ease: EASE_IN, duration: 0.7 }, 0.15)
              .fromTo(subheading, { y: 16, opacity: 0 }, { y: 0, opacity: 1, ease: EASE_IN, duration: 0.5 }, 0.3)
              .fromTo(
                bullets,
                { y: 12, opacity: 0 },
                { y: 0, opacity: 1, ease: EASE_IN, duration: 0.5, stagger: 0.07 },
                0.35
              );

            // ---- Pin + ghost exit ----
            // These triggers handle pinning only. The active-dot index is
            // derived from the container's progress above, not from here.
            const isLast = i === panels.length - 1;

            if (isLast) {
              ScrollTrigger.create({
                trigger: panel,
                start: "top top",
                end: "bottom top",
                pin: true,
                pinSpacing: false,
              });
            } else {
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: panel,
                    start: "top top",
                    end: "bottom top",
                    pin: true,
                    pinSpacing: false,
                    scrub: 0.4,
                  },
                })
                .fromTo(content, { opacity: 1, scale: 1 }, { opacity: 0.08, scale: 0.95, ease: EASE_HOLD, duration: 1 }, 0);
            }
          });
        }
      );
    },
    { scope: containerRef, dependencies: [services] }
  );

  return (
    <div ref={containerRef} className="relative isolate w-full">
      {services.map((service, index) => (
        <div
          key={service.number}
          ref={(el) => {
            panelRefs.current[index] = el;
          }}
          className="relative w-full h-screen"
          style={{ zIndex: index + 1 }}
        >
          <ServiceCard {...service} />
        </div>
      ))}

      {/* Side progress indicator: current service (01-05), unobtrusive */}
      <div
        aria-hidden="true"
        className={`hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-[60] flex-col items-center gap-4 transition-opacity duration-300 ${
          indicatorVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {services.map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-2.5 h-2.5 bg-red-500" : "w-1.5 h-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
