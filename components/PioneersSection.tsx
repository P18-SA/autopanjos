"use client";

import Sparkle from "@/components/ui/Sparkle";

const PIONEERS = [
  { name: "ARIA KALDER", role: "SOCIO GENERAL" },
  { name: "MARCO FREI", role: "PRINCIPAL" },
  { name: "YUKI SATO", role: "ANALISTA" },
];

export default function PioneersSection() {
  return (
    <section
      id="pioneers"
      style={{
        background: "var(--color-graphite)",
        padding: "var(--spacing-100) 0",
      }}
    >
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Sparkle size={40} />
          <h2 className="type-heading" style={{ color: "var(--color-ice-white)", fontSize: 48 }}>
            Conoce a los <span className="accent-word">pioneros</span>
          </h2>
        </div>

        {/* Cards row */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {PIONEERS.map(({ name, role }) => (
            <div
              key={name}
              id={`pioneer-${name.split(" ")[0].toLowerCase()}`}
              style={{
                flex: "1 1 280px",
                background: "var(--color-slate)",
                border: "1px solid rgba(216,234,255,0.15)",
                borderRadius: "var(--radius-largecards)",
                padding: "var(--card-padding)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(216,234,255,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(216,234,255,0.15)";
              }}
            >
              {/* Portrait placeholder */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "3/4",
                  background: "var(--color-carbon)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Abstract portrait silhouette */}
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                  <circle
                    cx="40" cy="28" r="18"
                    fill="rgba(216,234,255,0.08)"
                    stroke="rgba(216,234,255,0.15)"
                    strokeWidth="1"
                  />
                  <path
                    d="M8 80c0-17.673 14.327-32 32-32s32 14.327 32 32"
                    fill="rgba(216,234,255,0.06)"
                    stroke="rgba(216,234,255,0.1)"
                    strokeWidth="1"
                  />
                </svg>
                {/* Blue corner dot accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--color-electric-red)",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <p className="type-body" style={{ color: "var(--color-ice-white)", fontWeight: 400 }}>
                  {name}
                </p>
                <p className="type-caption" style={{ color: "var(--color-fog)" }}>
                  {role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
