"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LiquidBackground from "@/components/LiquidBackground";
import ArrowButton from "@/components/ArrowButton";

const CONTACT_EMAIL = "autopanjos@adinet.com.uy";

export default function ContactoPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // No backend exists in this project, so the form hands off to the
  // visitor's mail client with everything pre-filled. This keeps the page
  // genuinely functional instead of a dead form; swap this for a POST to a
  // real endpoint (or a service like Formspree/Resend) when one exists.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent("Consulta desde la web de Panjos");
    const body = encodeURIComponent(`${message}\n\nResponder a: ${email}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="relative w-full min-h-screen bg-[#060606] text-white overflow-x-hidden select-none">
      {/* Animated gradient field, same treatment as /nosotros */}
      <LiquidBackground />

      {/* Header: Shared Top Navigation Bar */}
      <Header />

      <section className="relative z-10 w-full min-h-screen flex flex-col pt-24 sm:pt-28 pb-8 px-6 sm:px-10 md:px-12">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-[auto_1fr] gap-10 md:gap-6">
          {/* Item 1: Title — always first */}
          <div className="order-1 md:col-span-8 lg:col-span-8 animate-component-left mt-4 md:mt-10">
            <h1 className="font-impact text-7xl sm:text-9xl md:text-[130px] lg:text-[165px] xl:text-[190px] uppercase text-white leading-[0.82] tracking-tighter drop-shadow-2xl">
              CONTACTO
            </h1>

            {/* TL;DR — where we are and how to reach us, above the fold. */}
            <p className="font-yi-baiti text-xs sm:text-sm text-gray-200 leading-snug mt-4 max-w-md">
              <span className="text-red-500 font-bold">TL;DR:</span> Estamos en
              Isla de Flores 1691, Palermo, Montevideo, a pocas cuadras de la
              Intendencia. Escribinos por el formulario o a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline hover:text-red-400 transition-colors"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              para coordinar tu reparación.
            </p>
          </div>

          {/* Item 2: Form — second on mobile, spans both rows on desktop (right column) */}
          <div className="order-2 md:col-span-4 lg:col-span-4 md:row-span-2 flex justify-center md:justify-end animate-component-right">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[280px] flex flex-col pt-2 md:pt-16"
            >
              <h2 className="sr-only">Formulario de contacto</h2>
              <p className="font-yi-baiti text-[11px] sm:text-xs text-gray-500 text-center leading-relaxed mb-3 px-2">
                Escribe tu mensaje aqui abajo y te contactaremos
              </p>

              {/* Submit sits above the fields, matching the reference layout.
                  A submit button anywhere inside the form still submits it. */}
              <ArrowButton label="Enviar" type="submit" />

              {/* Fields container */}
              <div className="red-container-box mt-4 px-5 py-5 flex flex-col">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-transparent border-b border-white/15 focus:border-red-500/70 outline-none font-yi-baiti text-base text-white placeholder:text-gray-500 pb-3 pt-2 transition-colors"
                />

                <label htmlFor="mensaje" className="sr-only">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mensaje"
                  className="w-full bg-transparent border-b border-white/15 focus:border-red-500/70 outline-none font-yi-baiti text-base text-white placeholder:text-gray-500 pb-3 pt-5 mt-4 resize-none transition-colors"
                />

                <p className="font-yi-baiti text-[11px] text-gray-500 text-center leading-relaxed mt-6">
                  Gracias por tu mensaje, responderemos tus dudas a la brevedad
                </p>

                <div className="mt-8 text-center">
                  <p className="font-yi-baiti text-[11px] text-gray-500">
                    Whatsapp
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-yi-baiti text-[11px] text-gray-500 hover:text-red-400 transition-colors"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
            </form>
          </div>

          {/* Item 3: Address — third on mobile, bottom-left on desktop */}
          <div className="order-3 md:col-span-8 lg:col-span-8 animate-component-left flex items-end pb-2">
            <div className="max-w-md w-full">
              <div className="flex items-start gap-2">
                {/* Map pin */}
                <svg
                  className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                </svg>
                <h2 className="font-yi-baiti text-base sm:text-lg font-bold text-white leading-tight">
                  Isla de Flores 1691, Palermo Montevideo
                </h2>
              </div>

              <p className="font-yi-baiti text-xs sm:text-sm text-gray-500 leading-relaxed mt-2 max-w-xs">
                Encuentra nuestro taller cerca tuyo ubicado a algunas cuadras de
                la intendecia de Montevideo
              </p>

              <p className="font-yi-baiti text-xs sm:text-sm text-gray-500 tracking-wider mt-1">
                MONTEVIDEO PALERMO ISLA DE FLORES
              </p>

              {/* Line + arrow indicator — links to Google Maps */}
              <a
                href="https://maps.app.goo.gl/YEKdUq6c6ZstDCCJ7"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver ubicación en Google Maps"
                className="flex items-center space-x-3 w-64 sm:w-80 mt-3 group cursor-pointer"
              >
                <div className="flex-1 h-[1.5px] bg-white/70 rounded-full" />
                <svg
                  className="w-6 h-6 text-white flex-shrink-0 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
