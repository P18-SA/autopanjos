import Sparkle from "@/components/ui/Sparkle";

const PORTFOLIO = [
  { name: "SOFTR", abbr: "S" },
  { name: "WANDELBOTS", abbr: "W" },
  { name: "ZENJOB", abbr: "ZJ" },
  { name: "LINUS", abbr: "L" },
  { name: "FORTO", abbr: "F" },
  { name: "MEISTER", abbr: "M" },
];

const SCAFFOLD_WORDS = ["SE", "HAN", "VUELTO", "INEVITABLES"];

export default function PortfolioGrid() {
  return (
    <section
      id="portfolio"
      style={{
        background: "var(--color-void-black)",
        padding: "var(--spacing-100) 0",
      }}
    >
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Section header */}
        <div style={{ display: "flex", gap: "var(--element-gap)", alignItems: "center" }}>
          <Sparkle size={32} />
          <h2 className="type-heading-sm" style={{ color: "var(--color-ice-white)" }}>
            Portafolio
          </h2>
        </div>

        {/* Editorial word scaffold */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SCAFFOLD_WORDS.map((word, i) => (
            <span
              key={word}
              className="type-caption"
              style={{
                color: i === SCAFFOLD_WORDS.length - 1
                  ? "var(--color-electric-red)"
                  : "var(--color-fog)",
                letterSpacing: "0.16em",
                fontSize: 10,
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* 3-column card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 32,
          }}
        >
          {PORTFOLIO.map(({ name, abbr }) => (
            <div key={name} className="portfolio-card" id={`portfolio-${name.toLowerCase()}`}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                {/* Logo placeholder */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: "1px solid rgba(216,234,255,0.3)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-monument)",
                    fontSize: 18,
                    color: "var(--color-ice-white)",
                  }}
                >
                  {abbr}
                </div>
                <span
                  className="type-caption"
                  style={{ color: "var(--color-fog)", fontSize: 10, letterSpacing: "0.16em" }}
                >
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
