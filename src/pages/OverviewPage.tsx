// ─────────────────────────────────────────────────────────────────────────────
// pages/OverviewPage.tsx
// Project overview — title, intro, 4 summary panels, theory section.
// Replaces the old HomePage with the spec-required layout.
// ─────────────────────────────────────────────────────────────────────────────

interface OverviewPageProps {
  onNavigate: (page: string) => void;
}

export default function OverviewPage({ onNavigate }: OverviewPageProps) {
  return (
    <div className="page-container">

      {/* ── Project Title Block ──────────────────────────────────────── */}
      <section style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
          Computer Organization and Architecture
        </p>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem" }}>
          E-Commerce Flash Sale: Performance Analysis Using Amdahl's Law
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Multicore Performance Analysis — Theoretical Study
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "70ch" }}>
          This project examines how serial and parallel execution fractions affect the
          performance of an e-commerce order-processing workload during a high-traffic
          flash sale event. Using Amdahl's Law, we compute the theoretical maximum speedup
          achievable as the number of CPU cores scales from 4 to 64, and determine the
          fundamental ceiling imposed by the serial fraction of the workload.
        </p>
      </section>

      {/* ── Four Summary Panels ──────────────────────────────────────── */}
      <section style={{ marginBottom: "2rem" }}>
        <p className="section-heading">Scenario Parameters
          <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--text-faint)", marginLeft: "0.75rem" }}>
            theoretical values based on the problem statement
          </span>
        </p>
        <div className="info-grid">
          <InfoCard
            id="panel-parallel"
            label="Parallel Fraction"
            value="85%"
            sub="P = 0.85 — can run on multiple cores"
          />
          <InfoCard
            id="panel-serial"
            label="Serial Fraction"
            value="15%"
            sub="S = 0.15 — must run sequentially"
          />
          <InfoCard
            id="panel-cores"
            label="Core Configurations"
            value="4 · 16 · 64"
            sub="three scenarios evaluated"
          />
          <InfoCard
            id="panel-max-speedup"
            label="Maximum Theoretical Speedup"
            value="6.67×"
            sub="limit as n → ∞ (1/S = 1/0.15)"
          />
        </div>
      </section>

      {/* ── Problem Statement ────────────────────────────────────────── */}
      <section style={{ marginBottom: "1.5rem" }}>
        <div className="panel">
          <h2 className="section-heading" style={{ marginBottom: "1rem" }}>Problem Statement</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "1rem" }}>
            During a flash sale, an e-commerce platform must process thousands of concurrent
            orders per second. The order-processing pipeline consists of two categories of work:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="sm:grid-cols-2">
            <WorkCategory
              title="Parallelisable work — 85%"
              items={[
                "Inventory stock lookup",
                "Payment validation",
                "Fraud detection checks",
                "Fulfilment routing",
              ]}
              accent="blue"
            />
            <WorkCategory
              title="Serial work — 15%"
              items={[
                "Final order confirmation",
                "Sequential database commit",
                "Order ID generation",
                "Audit log write",
              ]}
              accent="grey"
            />
          </div>
        </div>
      </section>

      {/* ── Amdahl's Law Explanation ─────────────────────────────────── */}
      <section style={{ marginBottom: "1.5rem" }}>
        <div className="panel">
          <h2 className="section-heading" style={{ marginBottom: "1rem" }}>Amdahl's Law</h2>

          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "1rem" }}>
            Amdahl's Law, proposed by Gene Amdahl in 1967, calculates the theoretical maximum
            speedup of a program when only a portion of it can be parallelised.
            The formula is:
          </p>

          {/* Formula */}
          <div className="formula-block" style={{ marginBottom: "1rem" }}>
            S(N) = 1 / ( (1 − P) + P/N )
          </div>

          {/* Variable definitions */}
          <table className="data-table" style={{ marginBottom: "1rem" }}>
            <thead>
              <tr>
                <th style={{ width: "5rem" }}>Symbol</th>
                <th>Meaning</th>
                <th>Value in this scenario</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono-cell">S(N)</td>
                <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Theoretical speedup with N cores</td>
                <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>computed for each N</td>
              </tr>
              <tr>
                <td className="mono-cell">P</td>
                <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Parallel fraction of the workload</td>
                <td className="mono-cell">0.85</td>
              </tr>
              <tr>
                <td className="mono-cell">(1 − P)</td>
                <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Serial fraction — the bottleneck</td>
                <td className="mono-cell">0.15</td>
              </tr>
              <tr>
                <td className="mono-cell">N</td>
                <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Number of CPU cores</td>
                <td className="mono-cell">4, 16, 64</td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "0.75rem" }}>
            <strong style={{ color: "var(--text)" }}>Why the serial portion limits speedup:</strong>{" "}
            Even if we parallelise 85% of the workload perfectly, the remaining 15% must
            still execute on a single core. As N increases, the parallel portion's execution
            time approaches zero, but the serial portion remains constant. The speedup ceiling
            is therefore <code>1 / 0.15 ≈ 6.67×</code>, regardless of how many cores are added.
          </p>

          {/* Questions answered */}
          <div
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: 5,
              padding: "0.875rem 1.125rem",
            }}
          >
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
              Questions this project answers
            </p>
            <ul style={{ fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.8, paddingLeft: "1.1rem" }}>
              <li>What is the speedup at 4, 16, and 64 cores for this workload?</li>
              <li>What is the theoretical maximum speedup, and why can it not be exceeded?</li>
              <li>How does efficiency (speedup per core) change as core count scales?</li>
              <li>At what point do additional cores yield negligible improvement?</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Quick results summary ─────────────────────────────────────── */}
      <section style={{ marginBottom: "1.5rem" }}>
        <div className="panel">
          <h2 className="section-heading" style={{ marginBottom: "1rem" }}>Computed Results</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cores (N)</th>
                <th>Speedup S(N)</th>
                <th>Efficiency (S/N)</th>
                <th>Gain over single core</th>
              </tr>
            </thead>
            <tbody>
              {[
                { n: 1,  speedup: "1.0000×",  eff: "100.0%", gain: "baseline" },
                { n: 4,  speedup: "2.7586×",  eff: "68.97%", gain: "+1.76×" },
                { n: 16, speedup: "4.9231×",  eff: "30.77%", gain: "+3.92×" },
                { n: 64, speedup: "6.1244×",  eff: "9.57%",  gain: "+5.12×" },
                { n: "∞", speedup: "6.6667×", eff: "→ 0%",   gain: "+5.67× (limit)" },
              ].map((row) => (
                <tr key={String(row.n)}>
                  <td className="mono-cell">{row.n}</td>
                  <td className="mono-cell" style={{ color: "var(--accent)", fontWeight: 600 }}>{row.speedup}</td>
                  <td className="mono-cell">{row.eff}</td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{row.gain}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.625rem" }}>
            All values computed using S(N) = 1 / (0.15 + 0.85/N). See the Speedup Calculator for interactive computation.
          </p>
        </div>
      </section>

      {/* ── Navigate CTA ─────────────────────────────────────────────── */}
      <section style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <NavButton id="cta-calculator" label="Open Speedup Calculator →" page="calculator" onNavigate={onNavigate} primary />
        <NavButton id="cta-graphs"     label="View Performance Graphs"   page="graphs"     onNavigate={onNavigate} />
      </section>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoCard({ id, label, value, sub }: { id: string; label: string; value: string; sub: string }) {
  return (
    <div id={id} className="info-card">
      <p className="info-card__label">{label}</p>
      <p className="info-card__value">{value}</p>
      <p className="info-card__sub">{sub}</p>
    </div>
  );
}

function WorkCategory({ title, items, accent }: { title: string; items: string[]; accent: "blue" | "grey" }) {
  const borderColor = accent === "blue" ? "#bfdbfe" : "#dde1e7";
  const bgColor     = accent === "blue" ? "#eff6ff" : "#f7f8fa";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        borderRadius: 5,
        padding: "0.75rem 1rem",
      }}
    >
      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
        {title}
      </p>
      <ul style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.9, paddingLeft: "1rem" }}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function NavButton({
  id, label, page, onNavigate, primary,
}: {
  id: string; label: string; page: string;
  onNavigate: (p: string) => void; primary?: boolean;
}) {
  return (
    <button
      id={id}
      onClick={() => onNavigate(page)}
      style={{
        fontSize: "0.825rem",
        fontWeight: 600,
        padding: "0.45rem 1rem",
        borderRadius: 4,
        cursor: "pointer",
        border: primary ? "1px solid var(--accent)" : "1px solid var(--border-strong)",
        background: primary ? "var(--accent)" : "var(--surface)",
        color: primary ? "#ffffff" : "var(--text-muted)",
        transition: "opacity 0.15s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseOut={(e)  => (e.currentTarget.style.opacity = "1")}
    >
      {label}
    </button>
  );
}
