// ─────────────────────────────────────────────────────────────────────────────
// pages/GraphsPage.tsx
// Phase 3: Performance Graphs — interactive Amdahl's Law visualisation.
//
// Contains:
//   - Parallel fraction slider (linked to App-level shared state)
//   - Graph 1: Cores vs Speedup (with max speedup reference line)
//   - Graph 2: Ideal Linear Speedup vs Amdahl's Law Actual Speedup
//   - Graph 3: Effect of the Serial Fraction (three scenarios)
//   - Metrics table: Speedup, Ideal, Efficiency, % of max
//   - Written performance interpretation (P = 0.85 default scenario)
// ─────────────────────────────────────────────────────────────────────────────

import {
  Graph1CoresVsSpeedup,
  Graph2IdealVsActual,
  Graph3SerialFractionImpact,
} from "../components/PerformanceGraphs";
import { calculateSpeedup, calculateMaxSpeedup } from "../calculations/amdahl";

// ── Constants ─────────────────────────────────────────────────────────────────

const TABLE_CORES = [1, 4, 16, 32, 64, 128, 256];

// ── Props ─────────────────────────────────────────────────────────────────────

interface GraphsPageProps {
  parallelFraction: number;
  onParallelFractionChange: (p: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GraphsPage({ parallelFraction, onParallelFractionChange }: GraphsPageProps) {
  const P        = parallelFraction;
  const S        = 1 - P;
  const maxSpeedup = calculateMaxSpeedup(P);
  const isUnbounded = !isFinite(maxSpeedup);

  // Build metrics table rows from the existing calculation function
  const metricsRows = TABLE_CORES.map((n) => {
    const speedup       = calculateSpeedup(P, n);
    const ideal         = n;
    const efficiency    = (speedup / n) * 100;     // percent
    const pctOfMax      = isUnbounded ? null : (speedup / maxSpeedup) * 100;
    return { n, speedup, ideal, efficiency, pctOfMax };
  });

  function handlePSlider(e: React.ChangeEvent<HTMLInputElement>) {
    onParallelFractionChange(parseFloat(e.target.value));
  }

  return (
    <div className="page-container--wide">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.2rem" }}>
          Performance Graphs
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Visual analysis of multicore speedup, core efficiency, and diminishing returns using Amdahl's Law.
          All values are <em>theoretical</em> — not measured server performance.
        </p>
      </section>

      {/* ── Shared parallel fraction control ─────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="section-heading">Parallel Fraction — Shared with Calculator</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <label
                htmlFor="graphs-p-slider"
                style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}
              >
                Parallel fraction (P)
              </label>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem", color: "var(--accent)", fontWeight: 700 }}>
                {(P * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="graphs-p-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={P}
              onChange={handlePSlider}
              style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
              aria-label="Parallel fraction for graphs"
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>
              <span>0% — fully serial</span>
              <span>100% — fully parallel</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <Stat label="Serial fraction" value={`${(S * 100).toFixed(0)}%`} />
            <Stat label="Max theoretical speedup" value={isUnbounded ? "∞" : `${maxSpeedup.toFixed(4)}×`} accent />
          </div>
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.75rem" }}>
          Adjusting this slider also updates the Speedup Calculator, and vice versa.
          Default scenario: P = 85%, S = 15%.
        </p>
      </div>

      {/* ── Graph 1: Cores vs Speedup ─────────────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <div className="section-heading">
          Graph 1 — Cores vs. Speedup
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.65 }}>
          Theoretical speedup S(N) = 1 / ((1 − P) + P/N) plotted against the number of CPU cores
          on a log₂ horizontal axis. The dashed red line marks the maximum theoretical ceiling
          S<sub>max</sub> = 1 / (1 − P). Notice how the curve flattens steeply after 16–32 cores:
          additional cores reduce the parallel component P/N towards zero, but the serial fraction
          (1 − P) remains fixed, hard-limiting further speedup gains.
        </p>
        <Graph1CoresVsSpeedup parallelFraction={P} />
      </div>

      {/* ── Graph 2: Ideal vs Actual ──────────────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <div className="section-heading">
          Graph 2 — Ideal Linear Speedup vs. Amdahl's Law
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.65 }}>
          Ideal linear scaling assumes the <em>entire</em> workload is parallelisable: S<sub>ideal</sub>(N) = N.
          In practice, even a small serial fraction prevents this — Amdahl's Law shows the actual
          theoretical ceiling. At 256 cores, the gap is extreme: ideal = 256×, actual ≈{" "}
          {calculateSpeedup(P, 256).toFixed(2)}×.
          This demonstrates why the serial fraction, not core count, is the dominant design constraint.
        </p>
        <Graph2IdealVsActual parallelFraction={P} />
      </div>

      {/* ── Graph 3: Serial Fraction Impact ──────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <div className="section-heading">
          Graph 3 — Effect of the Serial Fraction
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.65 }}>
          Comparing three scenarios — S = 15%, 10%, and 5% — at identical core counts. Reducing the
          serial portion even slightly produces a disproportionately large improvement in the speedup
          ceiling. Halving the serial fraction from 15% to 5% raises the maximum theoretical speedup
          from 6.67× to 20×. Adding more cores to a system with a fixed serial fraction yields
          diminishing returns far more quickly than reducing that serial fraction.
        </p>
        <Graph3SerialFractionImpact />
        {/* Scenario max speedup reference */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "0.875rem" }}>
          {[
            { P: 0.85, label: "P = 85%", color: "var(--accent)" },
            { P: 0.90, label: "P = 90%", color: "#059669" },
            { P: 0.95, label: "P = 95%", color: "#d97706" },
          ].map((s) => (
            <span key={s.P} style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", color: s.color, fontWeight: 700 }}>
                {s.label}
              </span>
              {" "}S<sub>max</sub> = {calculateMaxSpeedup(s.P).toFixed(2)}×
            </span>
          ))}
        </div>
      </div>

      {/* ── Metrics table ─────────────────────────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1.25rem", overflowX: "auto" }}>
        <h2 className="section-heading">
          Metrics Table — P = {(P * 100).toFixed(0)}%
          <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--text-faint)", marginLeft: "0.75rem" }}>
            theoretical values only
          </span>
        </h2>
        <table className="data-table" style={{ minWidth: "46rem" }}>
          <thead>
            <tr>
              <th>Cores (N)</th>
              <th>Amdahl Speedup S(N)</th>
              <th>Ideal Speedup (N)</th>
              <th>Core Efficiency</th>
              <th>% of Max Speedup</th>
            </tr>
          </thead>
          <tbody>
            {metricsRows.map((r) => (
              <tr
                key={r.n}
                style={{
                  background: [4, 16, 64].includes(r.n) ? "var(--accent-bg)" : undefined,
                  fontWeight: [4, 16, 64].includes(r.n) ? 600 : 400,
                }}
              >
                <td className="mono-cell">{r.n}</td>
                <td className="mono-cell" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  {r.speedup.toFixed(4)}×
                </td>
                <td className="mono-cell" style={{ color: "var(--text-muted)" }}>
                  {r.ideal}×
                </td>
                <td className="mono-cell">
                  {r.efficiency.toFixed(2)}%
                </td>
                <td className="mono-cell">
                  {r.pctOfMax !== null ? `${r.pctOfMax.toFixed(2)}%` : "—"}
                </td>
              </tr>
            ))}
            {/* Max speedup row */}
            {!isUnbounded && (
              <tr style={{ borderTop: "1px solid var(--border-strong)" }}>
                <td className="mono-cell" style={{ color: "var(--text-faint)" }}>∞ (limit)</td>
                <td className="mono-cell" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  {maxSpeedup.toFixed(4)}×
                </td>
                <td className="mono-cell" style={{ color: "var(--text-faint)" }}>—</td>
                <td className="mono-cell" style={{ color: "var(--text-faint)" }}>→ 0%</td>
                <td className="mono-cell" style={{ fontWeight: 700 }}>100.00%</td>
              </tr>
            )}
          </tbody>
        </table>
        <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>
          Reference cores (4, 16, 64) are highlighted. Core efficiency = S(N)/N × 100%.
          All values computed using S(N) = 1 / ((1 − P) + P/N).
        </p>
      </div>

      {/* ── Performance interpretation ────────────────────────────────── */}
      <div className="panel">
        <h2 className="section-heading">Performance Interpretation</h2>
        <DefaultInterpretation P={P} maxSpeedup={maxSpeedup} isUnbounded={isUnbounded} />
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)", marginBottom: "0.2rem" }}>
        {label}
      </p>
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "1rem", fontWeight: 700, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

function DefaultInterpretation({
  P, maxSpeedup, isUnbounded,
}: { P: number; maxSpeedup: number; isUnbounded: boolean }) {
  const s4  = calculateSpeedup(P, 4);
  const s16 = calculateSpeedup(P, 16);
  const s64 = calculateSpeedup(P, 64);
  const pctGain = s16 > 0 ? ((s64 - s16) / s16) * 100 : 0;

  return (
    <>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "1rem" }}>
        At the current parallel fraction <strong style={{ color: "var(--text)" }}>P = {(P * 100).toFixed(0)}%</strong>
        {" "}(serial fraction S = {((1 - P) * 100).toFixed(0)}%):
      </p>

      <ul style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 2.1, paddingLeft: "1.25rem", marginBottom: "1rem" }}>
        <li>
          At <strong style={{ color: "var(--text)" }}>1 core</strong>, speedup = <code>1.0×</code> (baseline — no parallelism benefit).
        </li>
        <li>
          At <strong style={{ color: "var(--text)" }}>4 cores</strong>, theoretical speedup ≈{" "}
          <code>{s4.toFixed(4)}×</code>.
        </li>
        <li>
          At <strong style={{ color: "var(--text)" }}>16 cores</strong>, theoretical speedup ≈{" "}
          <code>{s16.toFixed(4)}×</code>.
        </li>
        <li>
          At <strong style={{ color: "var(--text)" }}>64 cores</strong>, theoretical speedup ≈{" "}
          <code>{s64.toFixed(4)}×</code>.
        </li>
        <li>
          The <strong style={{ color: "var(--text)" }}>maximum theoretical speedup</strong> is{" "}
          {isUnbounded
            ? <span>unbounded (∞), because S = 0% — no serial bottleneck.</span>
            : <><code>{maxSpeedup.toFixed(4)}×</code> (limit as N → ∞).</>
          }
        </li>
      </ul>

      {!isUnbounded && (
        <>
          <div
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: 5,
              padding: "0.875rem 1.125rem",
              marginBottom: "0.875rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              lineHeight: 1.75,
            }}
          >
            <strong style={{ color: "var(--text)" }}>Diminishing returns:</strong>{" "}
            Increasing from 16 to 64 cores (a 4× increase in core count) produces only{" "}
            ≈ <strong style={{ color: "var(--accent)" }}>{pctGain.toFixed(1)}% additional speedup</strong>{" "}
            ({s16.toFixed(2)}× → {s64.toFixed(2)}×).
            This is the direct consequence of Amdahl's Law: the serial fraction ({((1 - P) * 100).toFixed(0)}%) is
            entirely immune to parallelisation, so it becomes an ever-larger proportion of the remaining
            execution time as the parallel portion approaches zero.
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.75 }}>
            <strong style={{ color: "var(--text)" }}>Engineering implication:</strong>{" "}
            For this workload, hardware investment above 16–32 cores yields rapidly
            diminishing returns. Reducing the serial fraction — by redesigning the sequential
            database commit, order confirmation, or audit log — would raise the speedup ceiling far
            more effectively than adding additional cores. For example, reducing S from 15% to 5%
            raises the maximum theoretical speedup from 6.67× to 20×, even before a single extra
            core is added. All values stated are <em>theoretical</em> and based solely on Amdahl's Law;
            actual system performance depends on memory bandwidth, I/O, OS scheduling, and other
            hardware factors not modelled here.
          </p>
        </>
      )}
    </>
  );
}
