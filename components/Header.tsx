"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "ABOUT", href: "/nosotros" },
    { name: "SERVICES", href: "/servicios" },
    { name: "CONTACT", href: "/contacto" },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 py-4 sm:py-6 px-6 sm:px-10 md:px-12 z-50 flex items-center justify-between w-full animate-component-top pointer-events-auto">
      {/* Brand Logo with Hamburger.
          `brand-group` ties the two logo PNGs together: hovering either one
          (or the space between them) glows both — see .brand-mark in
          globals.css. `group` is kept separately for the hamburger bars. */}
      <div className="flex items-center space-x-4 cursor-pointer group brand-group">
        {/* Mobile: hamburger that opens the dropdown below. Desktop-only from
            here down the dropdown is `md:hidden`, so the button had nothing
            to open on large screens — it's replaced there by the mark. */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menú"
          className="md:hidden flex flex-col justify-center space-y-1.5 w-7 h-5 focus:outline-none cursor-pointer"
        >
          <span className="w-full h-[3.5px] bg-white rounded-full group-hover:bg-red-500 transition-colors" />
          <span className="w-full h-[3.5px] bg-white rounded-full group-hover:bg-red-500 transition-colors" />
          <span className="w-full h-[3.5px] bg-white rounded-full group-hover:bg-red-500 transition-colors" />
        </button>

        {/* Desktop: monogram mark in the hamburger's place. Purely decorative
            (empty alt) — the PANJOS wordmark beside it is the actual link
            home and already carries the name. Intrinsic file is 1328x640;
            the 2.075 aspect is preserved via w-auto so it can never look
            squashed. */}
        <Image
          src="/cuvbe.png"
          alt=""
          width={58}
          height={28}
          priority
          className="brand-mark hidden md:block h-6 sm:h-7 w-auto"
        />
        <Link href="/" className="flex items-center">
          {/* PANJOS wordmark. Intrinsic file is 1031x114 (a very wide 9.04
              aspect), so the height is pinned and the width follows. */}
          <Image
            src="/logo-name.png"
            alt="PANJOS"
            width={253}
            height={28}
            priority
            className="brand-mark h-6 sm:h-7 w-auto"
          />
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center space-x-10">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href === "/servicios" && pathname?.startsWith("/servicios"));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`font-yi-baiti text-sm md:text-base uppercase tracking-widest transition-colors ${isActive
                  ? "text-white font-bold border-b-2 border-red-500 pb-0.5"
                  : "text-gray-300 hover:text-white"
                }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu Dropdown Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-6 right-6 z-50 bg-[#141414]/95 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 flex flex-col space-y-4 shadow-2xl animate-component-top">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/servicios" && pathname?.startsWith("/servicios"));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-yi-baiti text-lg uppercase tracking-widest ${isActive
                    ? "text-white font-bold border-l-2 border-red-500 pl-2"
                    : "text-gray-300 hover:text-white"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
