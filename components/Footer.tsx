export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-void-black)",
        borderTop: "1px solid rgba(216,234,255,0.1)",
        padding: "48px 0",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-monument)",
            fontSize: 16,
            color: "var(--color-ice-white)",
            letterSpacing: "0.02em",
          }}
        >
          atlantic
        </span>
        <span className="type-caption" style={{ color: "var(--color-fog)" }}>
          © 2026 ATLANTIC.VC — TODOS LOS DERECHOS RESERVADOS
        </span>
        <a href="#" className="btn-outlined" id="footer-cta">
          Seguir
        </a>
      </div>
    </footer>
  );
}
