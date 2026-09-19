"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LiquidBackground from "@/components/LiquidBackground";
import ArrowButton from "@/components/ArrowButton";
import {
  address,
  contactEmail,
  phoneDisplay,
  phoneNumber,
  whatsappDisplay,
  whatsappNumber,
} from "@/lib/site";

// wa.me only accepts digits — normalise so lib/site.ts can keep the "+".
const WA_DIGITS = whatsappNumber.replace(/\D/g, "");

// Same visual weight as ArrowButton so the three channels read as one set;
// WhatsApp overrides the background to red as the primary channel.
const CHANNEL_CLASSES =
  "w-full px-4 py-3 backdrop-blur-md rounded-xl border flex items-center gap-3 text-white transition-all group shadow-lg";

type Props = {
  /** Copy ya resuelta en el servidor: llega en el HTML, no se pide del browser. */
  content: { h1: string; direccion: string; texto: string };
};

export default function ContactoContent({ content }: Props) {
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
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="relative w-full min-h-screen bg-[#060606] text-white overflow-x-hidden select-none">
      {/* Animated gradient field, same treatment as /nosotros */}
      <LiquidBackground />

      {/* Header: Shared Top Navigation Bar */}
      <Header />

      <section className="pb-mobile-cta relative z-10 w-full min-h-screen flex flex-col pt-24 sm:pt-28 pb-8 px-6 sm:px-10 md:px-12">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-[auto_1fr] gap-10 md:gap-6">
          {/* Item 1: Title — always first */}
          <div className="order-1 md:col-span-8 lg:col-span-8 animate-component-left mt-4 md:mt-10">
            <h1 className="font-impact text-7xl sm:text-9xl md:text-[130px] lg:text-[165px] xl:text-[190px] uppercase text-white leading-[0.82] tracking-tighter drop-shadow-2xl">
              {content.h1}
            </h1>
          </div>

          {/* Item 2: Form — second on mobile, spans both rows on desktop (right column) */}
          <div className="order-2 md:col-span-4 lg:col-span-4 md:row-span-2 flex justify-center md:justify-end animate-component-right">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[280px] flex flex-col pt-2 md:pt-16"
            >
              {/* Direct channels first: most customers want to write or call
                  right away, so these lead and the form is the fallback. */}
              <h2 className="sr-only">Contacto directo</h2>
              <div className="flex flex-col gap-2.5 mb-8">
                <a
                  href={`https://wa.me/${WA_DIGITS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${CHANNEL_CLASSES} bg-red-600 hover:bg-red-500 border-red-500/60`}
                >
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A3 3 0 0 0 7 10a5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.9.7 1.9.5 2.3.5a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
                  </svg>
                  <span className="flex flex-col leading-tight">
                    <span className="font-yi-baiti text-[11px] uppercase tracking-wider text-white/80">
                      WhatsApp
                    </span>
                    <span className="font-yi-baiti text-base font-semibold whitespace-nowrap">
                      {whatsappDisplay}
                    </span>
                  </span>
                </a>

                <a
                  href={`tel:${phoneNumber}`}
                  className={`${CHANNEL_CLASSES} bg-[#262626]/80 hover:bg-[#333333]/90 border-white/10 hover:border-red-500/40`}
                >
                  <svg className="w-6 h-6 flex-shrink-0 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span className="flex flex-col leading-tight">
                    <span className="font-yi-baiti text-[11px] uppercase tracking-wider text-gray-400">
                      Llamadas
                    </span>
                    <span className="font-yi-baiti text-base font-semibold whitespace-nowrap">
                      {phoneDisplay}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${contactEmail}`}
                  className={`${CHANNEL_CLASSES} bg-[#262626]/80 hover:bg-[#333333]/90 border-white/10 hover:border-red-500/40`}
                >
                  <svg className="w-6 h-6 flex-shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
                  </svg>
                  <span className="flex flex-col leading-tight min-w-0">
                    <span className="font-yi-baiti text-[11px] uppercase tracking-wider text-gray-400">
                      Email
                    </span>
                    <span className="font-yi-baiti text-sm font-semibold break-all">
                      {contactEmail}
                    </span>
                  </span>
                </a>
              </div>

              <h2 className="sr-only">Formulario de contacto</h2>
              <p className="font-yi-baiti text-[11px] sm:text-xs text-gray-500 text-center leading-relaxed mb-3 px-2">
                O escribe tu mensaje aqui abajo y te contactaremos
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
                  {content.direccion}
                </h2>
              </div>

              <p className="font-yi-baiti text-xs sm:text-sm text-gray-500 leading-relaxed mt-2 max-w-xs">
                {content.texto}
              </p>

              <p className="font-yi-baiti text-xs sm:text-sm text-gray-500 tracking-wider mt-1">
                MONTEVIDEO PALERMO ISLA DE FLORES
              </p>

              {/* Line + arrow indicator — links to Google Maps. `arrow-hint-group`
                  makes the arrow replay its hover nudge every 5s (see
                  globals.css), which is the only cue that this is a link —
                  especially on touch, where there is no hover at all. */}
              <a
                href={address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver ubicación en Google Maps"
                className="arrow-hint-group flex items-center space-x-3 w-64 sm:w-80 mt-3 group cursor-pointer"
              >
                <div className="flex-1 h-[1.5px] bg-white/70 rounded-full" />
                <svg
                  className="arrow-hint w-6 h-6 text-white flex-shrink-0 transform group-hover:translate-x-1 transition-transform"
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
