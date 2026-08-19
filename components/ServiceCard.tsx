"use client";

import Image from "next/image";

export interface ServiceCardProps {
  number: string;
  title: string;
  description: string;
  subheading?: string;
  frequentServices: string[];
  imageSrc: string;
  imageAlt?: string;
}

/**
 * Visual markup for a single service panel.
 *
 * The `sc-*` class names below are animation hooks only (no styles attached
 * to them) — ServiceCardsStack queries for them with GSAP, scoped to this
 * panel, to drive the scroll-tied reveal/exit timelines. Renaming or
 * removing them will silently break the animation.
 */
export default function ServiceCard({
  number,
  title,
  description,
  subheading = "Servicios más frecuentes:",
  frequentServices,
  imageSrc,
  imageAlt,
}: ServiceCardProps) {
  const words = title.split(" ");

  return (
    <div className="pb-mobile-cta relative w-full h-full flex items-center justify-center p-6 sm:p-10 md:p-14 lg:p-16 select-none bg-[#060606] text-white">
      <div className="sc-content w-full flex flex-col md:flex-row items-center md:items-stretch gap-8 short-phone:gap-4 md:gap-12 lg:gap-16 h-full max-h-[85vh]">
        {/* Left Column: Narrow Tall Vertical Image Container */}
        {/* The mobile height is viewport-relative rather than a fixed pixel
            value. A flat 280px was a quarter of a tall phone but nearly half
            of a 640px-tall one, and on those small screens it pushed the
            title, number, description and bullet list off the bottom of the
            panel. `clamp()` ties it to the actual viewport with a floor so
            the photo never becomes a sliver, and `short-phone:` takes it down
            one more step on the handful of phones short enough that the text
            below still would not fit. `sm:` and `md:` are untouched, so
            tablets and desktop render exactly as before. */}
        <div className="red-container-box relative w-full md:w-56 lg:w-64 xl:w-72 h-[clamp(120px,22vh,240px)] short-phone:h-[max(88px,17vh)] sm:h-[380px] md:h-full flex-shrink-0 group shadow-2xl overflow-hidden">
          <div className="sc-image absolute inset-0 will-change-transform">
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              title={title}
              fill
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
          {/* Wipe overlay: covers the image, then slides up and out on reveal */}
          <div className="sc-image-overlay absolute inset-0 bg-[#060606] will-change-transform" />
        </div>

        {/* Right Column: Title, Number, Description & Frequent Services */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-2 short-phone:py-0 overflow-hidden">
          {/* Main Title - ALWAYS SINGLE LINE, word-by-word reveal */}
          <h3 className="font-impact text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[145px] text-white leading-none whitespace-nowrap min-w-0 tracking-tight mb-6 short-phone:mb-3 sm:mb-8 drop-shadow-2xl opacity-95">
            {words.map((word, idx) => (
              <span key={idx} className="inline-block overflow-hidden align-top">
                <span className="sc-title-word inline-block will-change-transform">
                  {word}
                  {idx < words.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h3>

          {/* Row: Big Number + Description Paragraph */}
          <div className="flex items-start space-x-6 sm:space-x-10 mb-6 short-phone:mb-3 sm:mb-8">
            {/* Huge Number */}
            <span className="sc-number font-impact text-7xl sm:text-9xl md:text-[140px] lg:text-[180px] text-white leading-[0.8] select-none tracking-tighter opacity-95 flex-shrink-0 will-change-transform">
              {number}
            </span>

            {/* Description Text */}
            <p className="sc-description font-yi-baiti text-sm sm:text-base md:text-lg lg:text-[28px] text-gray-500 leading-snug max-w-2xl pt-2 sm:pt-4 will-change-transform">
              {description}
            </p>
          </div>

          {/* Subheading & Frequent Services List.
              The `md:ml-52` (208px) below lines this block up under the
              description, clear of the huge number beside it — but the number
              is only ~96px wide on a phone, so while that indent applied at
              every width it left about 130px of usable space on a 360px
              screen and the list wrapped into a barely-readable column. It
              now starts at `md:`, where the number really is that wide. */}
          {frequentServices && frequentServices.length > 0 && (
            <div className="mt-2 md:ml-52">
              <h4 className="sc-subheading font-impact text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white uppercase tracking-wider mb-4 short-phone:mb-2 will-change-transform">
                {subheading}
              </h4>

              {/* List with Red Diamonds */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 short-phone:gap-y-2 font-yi-baiti text-sm sm:text-base md:text-lg text-gray-300">
                {frequentServices.map((item, idx) => (
                  <div key={idx} className="sc-bullet flex items-center space-x-2 will-change-transform">
                    <span className="text-red-500 text-xs sm:text-sm">◆</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
