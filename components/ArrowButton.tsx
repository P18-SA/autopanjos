"use client";

import Link from "next/link";

interface ArrowButtonProps {
  label: string;
  /** When set, renders a navigation link. Otherwise renders a <button>. */
  href?: string;
  /** Only used when `href` is omitted. */
  type?: "button" | "submit";
  /**
   * Layout-only classes for the call site (width, margins, stacking).
   * Appearance lives in BASE_CLASSES so every instance looks identical.
   */
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * The shared dark action bar: label on the left, long arrow on the right.
 *
 * Appearance is taken verbatim from the "Servicios" bar on the home page.
 * Width is deliberately NOT baked in — it is `w-full` here and each call
 * site constrains it (the home page uses `sm:w-72 md:w-80`, the contact form
 * is bounded by its own column), because hard-coding a `sm:`/`md:` width
 * would overflow the narrow contact column and could not be overridden from
 * `className`: Tailwind resolves conflicts by CSS source order, not by the
 * order classes appear in the attribute, so a later `w-full` would not beat
 * an earlier `sm:w-72` at ≥640px.
 */
const BASE_CLASSES =
  "w-full px-5 py-2.5 bg-[#262626]/80 hover:bg-[#333333]/90 backdrop-blur-md rounded-xl border border-white/10 hover:border-red-500/40 flex items-center justify-between text-white transition-all group shadow-lg cursor-pointer";

function ArrowButtonContent({ label }: { label: string }) {
  return (
    <>
      <span className="font-yi-baiti text-sm sm:text-base font-normal">
        {label}
      </span>
      {/* Long arrow, kept from the contact page's original button */}
      <svg
        className="w-9 h-5 text-white transform group-hover:translate-x-1.5 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        viewBox="0 0 40 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2 12h34m0 0l-7-7m7 7l-7 7"
        />
      </svg>
    </>
  );
}

export default function ArrowButton({
  label,
  href,
  type = "button",
  className = "",
  onMouseEnter,
  onMouseLeave,
}: ArrowButtonProps) {
  const classes = `${BASE_CLASSES} ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <ArrowButtonContent label={label} />
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ArrowButtonContent label={label} />
    </button>
  );
}
