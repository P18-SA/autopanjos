import ParticleCanvas from "@/components/ui/ParticleCanvas";

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "var(--color-carbon)",
        paddingTop: 64,
      }}
    >
      <ParticleCanvas />

      {/* Content */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          textAlign: "center",
        }}
      >
        <p
          className="type-caption animate-fade-in-up"
          style={{ color: "var(--color-fog)", letterSpacing: "0.16em" }}
        >
          OBSERVATORIO DE INVERSIÓN EN ETAPA INICIAL
        </p>

        <h1
          className="type-display"
          style={{
            color: "var(--color-ice-white)",
            maxWidth: 960,
            perspective: "800px",
            transformStyle: "preserve-3d",
          }}
        >
          <span className="hero-word hero-word-1">LO</span>{" "}
          <span className="hero-word hero-word-2 accent-word">DESCONOCIDO</span>{" "}
          <span className="hero-word hero-word-3">SE VUELVE</span><br />
        </h1>

        {/* Bordered frame indicator */}
        <div
          className="bordered-frame animate-fade-in-up animate-fade-in-up-delay-2"
          style={{ padding: "12px 32px", display: "flex", alignItems: "center", gap: 8 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-electric-red)",
              display: "inline-block",
            }}
          />
          <span className="type-caption" style={{ color: "var(--color-ice-white)" }}>
            CAPITAL DE RIESGO · BERLÍN · EST 2019
          </span>
        </div>

        {/* Scroll indicator */}
        <div style={{ marginTop: 48 }}>
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
      </div>
    </section>
  );
}
