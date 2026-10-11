// ─────────────────────────────────────────────────────────────────────────────
// pages/GraphsPage.tsx
// Performance Graphs — placeholder for Phase 2 (Recharts implementation).
// ─────────────────────────────────────────────────────────────────────────────

export default function GraphsPage() {
  return (
    <div className="page-container">
      <section style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
          Performance Graphs
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Visual representation of speedup and efficiency curves across core configurations.
        </p>
      </section>

      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="section-heading">What will be shown here</h2>
        <ul style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 2, paddingLeft: "1.25rem" }}>
          <li>Speedup curve: S(N) vs. N for the flash sale scenario (P = 0.85)</li>
          <li>Theoretical maximum line at S = 6.67× for reference</li>
          <li>Efficiency curve: S(N)/N vs. N — shows diminishing returns clearly</li>
          <li>Comparison of speedup curves for different parallel fractions (P = 0.5, 0.75, 0.85, 0.95)</li>
        </ul>
      </div>

      <div className="placeholder-section" style={{ marginBottom: "1.25rem" }}>
        <p className="placeholder-section__title">Speedup vs. Core Count — Graph</p>
        <p className="placeholder-section__desc">
          This chart will be implemented in Phase 2 using Recharts.<br />
          It will plot S(N) = 1 / (0.15 + 0.85/N) from N = 1 to N = 128,
          with the theoretical ceiling marked at 6.67×.
        </p>
      </div>

      <div className="placeholder-section">
        <p className="placeholder-section__title">Efficiency vs. Core Count — Graph</p>
        <p className="placeholder-section__desc">
          This chart will plot per-core efficiency E(N) = S(N)/N,
          illustrating how efficiency drops sharply as cores increase.
        </p>
      </div>
    </div>
  );
}
