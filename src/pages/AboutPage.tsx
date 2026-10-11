// ─────────────────────────────────────────────────────────────────────────────
// pages/AboutPage.tsx
// Project information, objectives, and technology stack.
// ─────────────────────────────────────────────────────────────────────────────

const OBJECTIVES = [
  "Demonstrate Amdahl's Law through a practical, interactive application",
  "Model a realistic e-commerce order-processing system under peak load",
  "Show how parallel fraction and core count affect theoretical speedup",
  "Illustrate diminishing returns in parallel computing with concrete numbers",
  "Present all calculations in a form verifiable by hand or calculator",
];

const TECH_STACK = [
  { name: "React 19",      desc: "UI component library" },
  { name: "TypeScript",    desc: "Type-safe JavaScript" },
  { name: "Vite",          desc: "Build tool and dev server" },
  { name: "Tailwind CSS",  desc: "Utility-first CSS framework" },
  { name: "Recharts",      desc: "Charting library (Phase 2)" },
  { name: "Vitest",        desc: "Unit testing framework" },
];

export default function AboutPage() {
  return (
    <div className="page-container">

      {/* Header */}
      <section style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
          About the Project
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Computer Organization and Architecture — Academic project
        </p>
      </section>

      {/* Project summary */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="section-heading">Project Summary</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "1rem" }}>
          This project applies Amdahl's Law to an e-commerce order-processing workload to
          determine how much performance can be gained by adding CPU cores during a flash
          sale event. The workload is split into an 85% parallelisable fraction and a 15%
          serial fraction. We compute the theoretical speedup at 4, 16, and 64 cores, and
          establish that the maximum achievable speedup — regardless of core count — is bounded
          at approximately 6.67×.
        </p>

        <h3 className="section-heading" style={{ marginTop: "1.25rem" }}>Objectives</h3>
        <ul style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.9, paddingLeft: "1.25rem" }}>
          {OBJECTIVES.map((obj) => <li key={obj}>{obj}</li>)}
        </ul>
      </div>

      {/* Scenario parameters */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="section-heading">Scenario Parameters</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Symbol</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Parallel fraction",         sym: "P",     val: "0.85  (85%)" },
              { label: "Serial fraction",            sym: "1 − P", val: "0.15  (15%)" },
              { label: "Core configurations tested", sym: "N",     val: "4, 16, 64" },
              { label: "Speedup at 4 cores",         sym: "S(4)",  val: "≈ 2.7586×" },
              { label: "Speedup at 16 cores",        sym: "S(16)", val: "≈ 4.9231×" },
              { label: "Speedup at 64 cores",        sym: "S(64)", val: "≈ 6.1244×" },
              { label: "Maximum theoretical speedup",sym: "1/S",   val: "≈ 6.6667×" },
            ].map((row) => (
              <tr key={row.label}>
                <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{row.label}</td>
                <td className="mono-cell">{row.sym}</td>
                <td className="mono-cell" style={{ color: "var(--accent)" }}>{row.val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Technology stack */}
      <div className="panel">
        <h2 className="section-heading">Technology Stack</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Library / Tool</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {TECH_STACK.map((t) => (
              <tr key={t.name}>
                <td className="mono-cell">{t.name}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{t.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
