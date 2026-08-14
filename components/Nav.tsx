"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = ["INICIO", "ENFOQUE", "EQUIPO", "PORTAFOLIO", "HISTORIAS", "EMPLEOS"];

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: isScrolled ? "1px solid transparent" : "1px solid rgba(216,234,255,0.08)",
        background: isScrolled ? "transparent" : "rgba(0,0,0,0.7)",
        backdropFilter: isScrolled ? "none" : "blur(12px)",
        transition: "all 0.3s ease",
        mixBlendMode: isScrolled ? "difference" : "normal",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", height: 64, gap: 32 }}
      >
        {/* Wordmark */}
        <span
          style={{
            fontFamily: "var(--font-monument)",
            fontSize: 16,
            fontWeight: 400,
            color: "var(--color-ice-white)",
            letterSpacing: "0.02em",
            marginRight: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Geometric glyph */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="14" height="14" stroke="#d8eaff" strokeWidth="1" />
            <rect x="4" y="4" width="8" height="8" stroke="#f21f1f" strokeWidth="1" />
            <rect x="7" y="7" width="2" height="2" fill="#f21f1f" />
          </svg>
          atlantic
        </span>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {NAV_LINKS.map((link, i) => (
            <a
              key={link}
              href="#"
              className={`nav-link${i === 0 ? " active" : ""}`}
              id={`nav-${link.toLowerCase()}`}
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a href="#" className="btn-outlined" id="nav-cta" style={{ marginLeft: 32 }}>
          Seguir
        </a>
      </div>
    </nav>
  );
}
