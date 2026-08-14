import Sparkle from "@/components/ui/Sparkle";

const COLORS = [
  { name: "Ice White",       value: "#d8eaff", token: "--color-ice-white" },
  { name: "Void Black",      value: "#000000", token: "--color-void-black" },
  { name: "Carbon",          value: "#0d0d0f", token: "--color-carbon" },
  { name: "Graphite",        value: "#232529", token: "--color-graphite" },
  { name: "Slate",           value: "#2b2f33", token: "--color-slate" },
  { name: "Iron",            value: "#41464c", token: "--color-iron" },
  { name: "Steel",           value: "#565e66", token: "--color-steel" },
  { name: "Fog",             value: "#6c757f", token: "--color-fog" },
  { name: "Electric Red",    value: "#f21f1f", token: "--color-electric-red" },
  { name: "Signal Orange",   value: "#ff4105", token: "--color-signal-orange" },
];

const SURFACES = [
  { label: "VOID · #000",       bg: "#000000" },
  { label: "CARBON · #0D0D0F",  bg: "#0d0d0f" },
  { label: "GRAPHITE · #232529", bg: "#232529" },
  { label: "SLATE · #2B2F33",   bg: "#2b2f33" },
];

export default function ComponentShowcase() {
  return (
    <section
      id="components"
      style={{
        background: "var(--color-void-black)",
        padding: "var(--spacing-100) 0",
        borderTop: "1px solid rgba(216,234,255,0.08)",
      }}
    >
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 64 }}>

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Sparkle size={32} />
          <h2 className="type-heading-sm" style={{ color: "var(--color-ice-white)" }}>
            Sistema de Diseño
          </h2>
        </div>

        {/* ── Colors ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p className="type-caption" style={{ color: "var(--color-fog)" }}>COLORES</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {COLORS.map(({ name, value, token }) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 110 }}>
                <div
                  style={{
                    width: 110,
                    height: 64,
                    background: value,
                    borderRadius: 8,
                    border: "1px solid rgba(216,234,255,0.15)",
                  }}
                />
                <span
                  className="type-caption"
                  style={{ color: "var(--color-fog)", letterSpacing: "0.1em", fontSize: 9 }}
                >
                  {name}
                </span>
                <span
                  className="type-caption"
                  style={{ color: "var(--color-steel)", letterSpacing: "0.06em", fontSize: 8 }}
                >
                  {token}
                </span>
              </div>
            ))}
          </div>
        </div>

        <hr className="hairline" />

        {/* ── Typography ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <p className="type-caption" style={{ color: "var(--color-fog)" }}>TIPOGRAFÍA</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div>
              <span className="type-caption" style={{ color: "var(--color-steel)", display: "block", marginBottom: 8 }}>
                DISPLAY · 96px / lh 1.0 / ls -2.88px
              </span>
              <p className="type-display" style={{ color: "var(--color-ice-white)", fontSize: "clamp(40px, 6vw, 96px)" }}>
                Lo <span className="accent-word">Desconocido</span>
              </p>
            </div>

            <div>
              <span className="type-caption" style={{ color: "var(--color-steel)", display: "block", marginBottom: 8 }}>
                HEADING · 64px / lh 1.06 / ls -0.64px
              </span>
              <p className="type-heading" style={{ color: "var(--color-ice-white)", fontSize: "clamp(32px, 4vw, 64px)" }}>
                Inevitable
              </p>
            </div>

            <div>
              <span className="type-caption" style={{ color: "var(--color-steel)", display: "block", marginBottom: 8 }}>
                HEADING SM · 24px / lh 1.24 / ls -0.24px
              </span>
              <p className="type-heading-sm" style={{ color: "var(--color-ice-white)" }}>
                Conoce a los pioneros
              </p>
            </div>

            <div>
              <span className="type-caption" style={{ color: "var(--color-steel)", display: "block", marginBottom: 8 }}>
                BODY · 14px / lh 1.5 / ls 0.84px
              </span>
              <p className="type-body" style={{ color: "var(--color-fog)", maxWidth: 480 }}>
                Apoyamos a fundadores que ven el mundo antes de que llegue — construyendo
                software que reestructura industrias y reprograma la coordinación humana.
              </p>
            </div>

            <div>
              <span className="type-caption" style={{ color: "var(--color-steel)", display: "block", marginBottom: 8 }}>
                CAPTION (MONO) · 10px / ls 1.6px / uppercase
              </span>
              <p className="type-caption" style={{ color: "var(--color-ice-white)" }}>
                ETAPA INICIAL · BERLÍN · EST 2019
              </p>
            </div>
          </div>
        </div>

        <hr className="hairline" />

        {/* ── Components ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <p className="type-caption" style={{ color: "var(--color-fog)" }}>COMPONENTES</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>

            {/* Outlined action button */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="type-caption" style={{ color: "var(--color-steel)", fontSize: 9 }}>BOTÓN DE ACCIÓN CONTORNEADO</span>
              <a href="#" className="btn-outlined" id="showcase-cta-primary">Seguir</a>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="type-caption" style={{ color: "var(--color-steel)", fontSize: 9 }}>ETIQUETA</span>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="tag">Fintech</span>
                <span className="tag">SaaS</span>
                <span className="tag">B2B</span>
              </div>
            </div>

            {/* Pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="type-caption" style={{ color: "var(--color-steel)", fontSize: 9 }}>PÍLDORA</span>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="pill">Series A</span>
                <span className="pill">Seed</span>
              </div>
            </div>

            {/* Bordered frame */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="type-caption" style={{ color: "var(--color-steel)", fontSize: 9 }}>MARCO CON BORDE</span>
              <div
                className="bordered-frame"
                style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 8 }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-electric-red)" }} />
                <span className="type-caption" style={{ color: "var(--color-ice-white)" }}>CONTENEDOR DE WIREFRAME</span>
              </div>
            </div>

            {/* Scroll indicator */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="type-caption" style={{ color: "var(--color-steel)", fontSize: 9 }}>INDICADOR DE DESPLAZAMIENTO</span>
              <div className="scroll-indicator">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M5 2v6M2 6l3 3 3-3"
                    stroke="#d8eaff"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Sparkle */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="type-caption" style={{ color: "var(--color-steel)", fontSize: 9 }}>DESTELLO DECORATIVO</span>
              <Sparkle size={40} />
            </div>
          </div>
        </div>

        <hr className="hairline" />

        {/* ── Surfaces ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p className="type-caption" style={{ color: "var(--color-fog)" }}>SUPERFICIES (PASOS DE ELEVACIÓN)</p>
          <div
            style={{
              display: "flex",
              gap: 0,
              border: "1px solid rgba(216,234,255,0.15)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {SURFACES.map(({ label, bg }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  background: bg,
                  padding: "24px 16px",
                  display: "flex",
                  alignItems: "flex-end",
                  minHeight: 100,
                }}
              >
                <span className="type-caption" style={{ color: "rgba(216,234,255,0.4)", fontSize: 8 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
