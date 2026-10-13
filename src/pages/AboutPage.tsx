// ─────────────────────────────────────────────────────────────────────────────
// pages/AboutPage.tsx
// Project information, objectives, and technology stack.
// ─────────────────────────────────────────────────────────────────────────────

const OBJECTIVES = [
  "Demonstrate Amdahl's Law through a practical, interactive application",
  "Model a realistic e-commerce order-processing system under peak load",
  "Show how parallel fraction and core count affect theoretical speedup",
  "Illustrate diminishing returns in parallel computing with concrete numbers",
  "Compare server configurations (4 to 128 cores) using theoretical metrics",
  "Present all calculations in a form verifiable by hand or calculator",
];

const TECH_STACK = [
  { name: "React 19",      desc: "UI component library" },
  { name: "TypeScript",    desc: "Type-safe JavaScript" },
  { name: "Vite",          desc: "Build tool and dev server" },
  { name: "Tailwind CSS",  desc: "Utility-first CSS framework" },
  { name: "Recharts",      desc: "Interactive charting library" },
  { name: "Vitest",        desc: "Unit testing framework" },
];

interface AboutPageProps {
  onNavigate?: (page: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps = {}) {
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
          serial fraction. We compute the theoretical speedup across multiple core counts
          (4, 16, 32, 64, and 128 cores), and establish that the maximum achievable speedup —
          regardless of core count — is bounded at approximately 6.67×.
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
              { label: "Core configurations tested", sym: "N",     val: "4, 16, 32, 64, 128" },
              { label: "Speedup at 4 cores",         sym: "S(4)",  val: "≈ 2.7586×" },
              { label: "Speedup at 16 cores",        sym: "S(16)", val: "≈ 4.9231×" },
              { label: "Speedup at 32 cores",        sym: "S(32)", val: "≈ 5.6637×" },
              { label: "Speedup at 64 cores",        sym: "S(64)", val: "≈ 6.1244×" },
              { label: "Speedup at 128 cores",       sym: "S(128)", val: "≈ 6.3840×" },
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
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
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

      {/* Limitations */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="section-heading">Assumptions and Limitations</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "0.875rem" }}>
          Amdahl's Law gives an <strong style={{ color: "var(--text)" }}>upper bound</strong> on
          theoretical speedup. Actual server performance will always be lower because:
        </p>
        <ul style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 2, paddingLeft: "1.25rem", marginBottom: "0.875rem" }}>
          <li>Memory bandwidth and cache contention limit practical parallelism.</li>
          <li>Inter-core communication and lock synchronisation add overhead not modelled here.</li>
          <li>OS scheduling, context switching, and I/O latency reduce effective core utilisation.</li>
          <li>The true parallel fraction P must be measured under real load — it cannot be assumed.</li>
          <li>Cost inputs in the Server Comparison are user-supplied assumptions, not verified prices.</li>
        </ul>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-faint)",
            background: "var(--mono-bg)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "0.6rem 0.875rem",
          }}
        >
          All speedup values displayed throughout this application are <em>theoretical predictions</em> derived
          from Amdahl's Law. They are not benchmark measurements and should not be treated as guaranteed
          production performance.
        </div>
      </div>

      {/* CTA navigation buttons */}
      {onNavigate && (
        <section style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button
            id="about-cta-overview"
            onClick={() => onNavigate("overview")}
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "0.4rem 0.9rem",
              borderRadius: 4,
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            ← Overview
          </button>
          <button
            id="about-cta-calculator"
            onClick={() => onNavigate("calculator")}
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "0.4rem 0.9rem",
              borderRadius: 4,
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Open Speedup Calculator →
          </button>
          <button
            id="about-cta-graphs"
            onClick={() => onNavigate("graphs")}
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "0.4rem 0.9rem",
              borderRadius: 4,
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Performance Graphs
          </button>
          <button
            id="about-cta-comparison"
            onClick={() => onNavigate("comparison")}
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "0.4rem 0.9rem",
              borderRadius: 4,
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Server Comparison
          </button>
        </section>
      )}

    </div>
  );
}
