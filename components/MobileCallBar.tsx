import { phoneNumber, phoneDisplay, whatsappNumber, contactEmail } from "@/lib/site";

/**
 * Fixed call-to-action bar, mobile only (`md:hidden`).
 *
 * Renders nothing at all while `phoneNumber` is empty in lib/site.ts — a
 * `tel:` link with a placeholder number is worse than no button, because
 * customers actually dial it. Fill the number in and this appears.
 *
 * A server component: it reads static config and has no interactivity, so it
 * ships zero JavaScript.
 */
export default function MobileCallBar() {
  if (!phoneNumber) return null;

  // wa.me only accepts digits — a leading "+" or any spacing produces a
  // broken link. Normalise here so lib/site.ts can be filled in with
  // whatever formatting reads best.
  const waDigits = whatsappNumber.replace(/\D/g, "");
  const hasWhatsapp = waDigits.length > 0;

  return (
    <>
      {/* Spacer so the fixed bar never covers the last line of page content. */}
      <div aria-hidden="true" className="md:hidden h-16" />

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] flex items-stretch gap-2 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] bg-[#0b0b0b]/95 backdrop-blur-md border-t border-white/10">
        <a
          href={`tel:${phoneNumber}`}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 px-4 py-3 font-yi-baiti text-base font-semibold text-white transition-colors"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
          </svg>
          <span>Llamar{phoneDisplay ? ` ${phoneDisplay}` : ""}</span>
        </a>

        {hasWhatsapp ? (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribir por WhatsApp"
            className="flex items-center justify-center rounded-xl border border-white/15 bg-[#262626]/80 hover:bg-[#333333]/90 px-4 transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A3 3 0 0 0 7 10a5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.9.7 1.9.5 2.3.5a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
            </svg>
          </a>
        ) : (
          <a
            href={`mailto:${contactEmail}`}
            aria-label="Escribirnos por correo"
            className="flex items-center justify-center rounded-xl border border-white/15 bg-[#262626]/80 hover:bg-[#333333]/90 px-4 transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
            </svg>
          </a>
        )}
      </div>
    </>
  );
}
