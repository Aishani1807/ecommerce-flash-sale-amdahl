// ─────────────────────────────────────────────────────────────────────────────
// pages/ComparisonPage.tsx
// Server Comparison — placeholder for Phase 2.
// ─────────────────────────────────────────────────────────────────────────────

export default function ComparisonPage() {
  return (
    <div className="page-container">
      <section style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
          Server Comparison
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Comparison of order-processing throughput across different server configurations.
        </p>
      </section>

      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="section-heading">What will be shown here</h2>
        <ul style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 2, paddingLeft: "1.25rem" }}>
          <li>Side-by-side comparison: single-core vs. 4-core vs. 16-core vs. 64-core servers</li>
          <li>Estimated orders/second throughput at each configuration</li>
          <li>Cost-efficiency analysis (speedup gained per additional core)</li>
          <li>Identification of the optimal core count for this workload</li>
        </ul>
      </div>

      <div className="placeholder-section">
        <p className="placeholder-section__title">Server Configuration Comparison Table</p>
        <p className="placeholder-section__desc">
          This section will be implemented in Phase 2.<br />
          It will show a structured comparison of server configurations with
          computed throughput estimates derived from Amdahl's Law speedup values.
        </p>
      </div>
    </div>
  );
}
