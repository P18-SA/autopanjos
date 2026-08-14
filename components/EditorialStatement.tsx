export default function EditorialStatement() {
  return (
    <section
      id="statement"
      style={{
        background: "var(--color-graphite)",
        padding: "var(--spacing-100) 0",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}
      >
        <hr className="hairline" style={{ width: "100%" }} />
        <p
          className="type-body"
          style={{
            color: "var(--color-fog)",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 2,
            fontSize: 16,
          }}
        >
          Apoyamos a fundadores que ven el mundo antes de que llegue — construyendo
          software que reestructura industrias, redefine el trabajo y reprograma
          cómo los humanos se coordinan a gran escala. Lo desconocido no es un riesgo a gestionar.
          Es la única dirección que vale la pena habitar.
        </p>
        <hr className="hairline" style={{ width: "100%" }} />
      </div>
    </section>
  );
}
