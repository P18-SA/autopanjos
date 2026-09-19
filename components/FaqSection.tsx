"use client";

import { useState } from "react";
import Link from "next/link";

type Faq = {
  question: string;
  answer: string;
  /** Optional follow-up link shown under the answer. */
  link?: { href: string; label: string };
};

const FAQS: Faq[] = [
  {
    question: "¿Que marcas y modelos de vehículos atienden?",
    answer: "Atendemos todos los vehiculos con motor a inyeccion electrónica",
  },
  {
    question: "¿Tienen servicio de remolque o auxilio mecánico?",
    answer: "De momento no contamos con remolque",
  },
  {
    question: "¿Qué idioma se habla?",
    answer: "Español, inglés y Portugues",
  },
  {
    question: "Moneda y cambio",
    answer: "Aceptamos distintas divisas y monedas, verifique con nuestro equipo de ventas",
  },
  {
    question: "¿Qué puedo hacer mientras mi auto está en el taller?",
    answer:
      "Estamos en Palermo, a pocas cuadras de la Rambla y cerca del Parque Rodó. Armamos un recorrido a pie con lo que hay para ver en el barrio mientras esperas.",
    // The only way into /mientras-esperas: it is not in the menu or sitemap.
    link: { href: "/mientras-esperas", label: "Ver qué hay cerca del taller" },
  },
];

/**
 * FAQPage structured data. Built from the same FAQS array that renders on
 * screen, so the markup can never drift from the visible copy — Google
 * penalises structured data that does not match what the user sees.
 */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    // Transparent on purpose: both pages that use this section already paint
    // #060606 on their own wrapper, so this looks identical there — but it
    // also lets an animated background layer (see LiquidBackground on
    // /nosotros) show through instead of being covered by an opaque block.
    <section className="relative z-10 w-full py-16 sm:py-24 px-6 sm:px-10 md:px-12 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto flex flex-col gap-12 items-center">
        {/* Title */}
        <h2 className="font-impact text-7xl sm:text-9xl md:text-[130px] lg:text-[160px] xl:text-[150px] uppercase text-white leading-[0.82] tracking-tighter drop-shadow-2xl opacity-95">
          PREGUNTAS FRECUENTES
        </h2>

        {/* Accordion Items Container */}
        <div className="w-full max-w-3xl flex flex-col space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#0b0b0b] border border-red-900/40 hover:border-red-600/60 rounded-xl overflow-hidden transition-all duration-300 shadow-xl"
              >
                {/* Accordion Header. The button is wrapped in an h3 (not
                    styled as one) so each question is a real heading under the
                    section's h2 — previously the questions were plain spans,
                    leaving the section with no sub-structure for crawlers or
                    screen readers. */}
                <h3>
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between text-left cursor-pointer focus:outline-none group"
                >
                  <span className="font-yi-baiti text-base sm:text-xl text-white group-hover:text-red-400 transition-colors pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-red-500 transform transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                </h3>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-6 sm:px-8 pb-5 pt-1 flex flex-col items-center text-center animate-component-top">
                    {/* Divider line matching image */}
                    <div className="w-full max-w-md border-t border-red-900/30 mb-3" />
                    <p className="font-yi-baiti text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                      {faq.answer}
                    </p>
                    {faq.link && (
                      <Link
                        href={faq.link.href}
                        className="arrow-hint-group group mt-4 inline-flex items-center gap-2 font-yi-baiti text-sm sm:text-base text-red-400 hover:text-red-300 transition-colors"
                      >
                        {faq.link.label}
                        <svg
                          className="arrow-hint w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
