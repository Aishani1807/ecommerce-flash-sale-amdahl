// ─────────────────────────────────────────────────────────────────────────────
// pages/CalculatorPage.tsx
// Interactive Amdahl's Law speedup calculator.
// User adjusts parallel fraction and core count; results update immediately.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

function amdahlSpeedup(parallelFraction: number, cores: number): number {
  const serial = 1 - parallelFraction;
  return 1 / (serial + parallelFraction / cores);
}

function efficiency(speedup: number, cores: number): number {
  return speedup / cores;
}

const PRESET_CORES = [1, 2, 4, 8, 16, 32, 64, 128];

export default function CalculatorPage() {
  const [P, setP] = useState(0.85);
  const [N, setN] = useState(4);

  const speedup    = amdahlSpeedup(P, N);
  const eff        = efficiency(speedup, N);
  const maxSpeedup = 1 / (1 - P);

  return (
    <div className="page-container">

      {/* Header */}
      <section style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
          Speedup Calculator
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Adjust the parallel fraction and core count to compute Amdahl's Law speedup interactively.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="sm:grid-cols-2">

        {/* ── Inputs ──────────────────────────────────────────────────── */}
        <div className="panel">
          <h2 className="section-heading">Inputs</h2>

          {/* Parallel fraction slider */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.4rem" }}>
              Parallel fraction (P)
              <span style={{ fontFamily: "JetBrains Mono, monospace", marginLeft: "0.5rem", color: "var(--accent)" }}>
                {(P * 100).toFixed(0)}%
              </span>
            </label>
            <input
              id="input-parallel-fraction"
              type="range"
              min={0}
              max={0.99}
              step={0.01}
              value={P}
              onChange={(e) => setP(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-faint)", marginTop: "0.2rem" }}>
              <span>0% (fully serial)</span>
              <span>99% (nearly parallel)</span>
            </div>
          </div>

          {/* Core count input */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.4rem" }}>
              Number of cores (N)
            </label>
            <input
              id="input-core-count"
              type="number"
              min={1}
              max={1024}
              value={N}
              onChange={(e) => setN(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: "100%",
                padding: "0.4rem 0.625rem",
                fontSize: "0.875rem",
                fontFamily: "JetBrains Mono, monospace",
                border: "1px solid var(--border-strong)",
                borderRadius: 4,
                background: "var(--surface)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          {/* Preset core buttons */}
          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginBottom: "0.4rem" }}>Quick presets</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {PRESET_CORES.map((c) => (
                <button
                  key={c}
                  id={`preset-cores-${c}`}
                  onClick={() => setN(c)}
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "JetBrains Mono, monospace",
                    padding: "0.2rem 0.5rem",
                    borderRadius: 3,
                    border: N === c ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: N === c ? "var(--accent-bg)" : "var(--surface)",
                    color: N === c ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer",
                    fontWeight: N === c ? 600 : 400,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results ─────────────────────────────────────────────────── */}
        <div className="panel">
          <h2 className="section-heading">Results</h2>

          <ResultRow label="Parallel fraction (P)" value={P.toFixed(2)} />
          <ResultRow label="Serial fraction (1−P)"  value={(1 - P).toFixed(2)} />
          <ResultRow label="Number of cores (N)"    value={String(N)} />

          <div style={{ margin: "1rem 0", borderTop: "1px solid var(--border)" }} />

          <div style={{ marginBottom: "0.75rem" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
              Speedup S({N})
            </p>
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "2rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
              {speedup.toFixed(4)}×
            </p>
          </div>

          <ResultRow label="Efficiency (S/N)"           value={`${(eff * 100).toFixed(2)}%`} />
          <ResultRow label="Max theoretical speedup (1/S)" value={`${maxSpeedup.toFixed(4)}×`} />

          <div
            style={{
              marginTop: "1rem",
              padding: "0.625rem 0.875rem",
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: 4,
              fontSize: "0.8rem",
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--text)",
            }}
          >
            1 / ({(1-P).toFixed(2)} + {P.toFixed(2)}/{N}) = {speedup.toFixed(4)}
          </div>
        </div>
      </div>

      {/* ── Step-by-step working ─────────────────────────────────────── */}
      <div className="panel" style={{ marginTop: "1.25rem" }}>
        <h2 className="section-heading">Step-by-Step Calculation</h2>
        <ol style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 2 }}>
          <li>Given: <code>P = {P.toFixed(2)}</code>, serial fraction <code>S = {(1-P).toFixed(2)}</code>, <code>N = {N}</code></li>
          <li>Formula: <code>S(N) = 1 / ((1 − P) + P/N)</code></li>
          <li>Substitute: <code>= 1 / ({(1-P).toFixed(2)} + {P.toFixed(2)}/{N})</code></li>
          <li>Parallel term: <code>P/N = {P.toFixed(2)}/{N} = {(P/N).toFixed(6)}</code></li>
          <li>Denominator: <code>{(1-P).toFixed(2)} + {(P/N).toFixed(6)} = {((1-P) + P/N).toFixed(6)}</code></li>
          <li>Result: <code>1 / {((1-P) + P/N).toFixed(6)} = <strong>{speedup.toFixed(4)}×</strong></code></li>
        </ol>
      </div>

      {/* ── Comparison table for scenario cores ──────────────────────── */}
      <div className="panel" style={{ marginTop: "1.25rem" }}>
        <h2 className="section-heading">Comparison at P = {(P * 100).toFixed(0)}%</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Cores (N)</th>
              <th>Speedup S(N)</th>
              <th>Efficiency</th>
              <th>% of theoretical maximum</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 4, 8, 16, 32, 64].map((c) => {
              const s = amdahlSpeedup(P, c);
              const e = efficiency(s, c);
              const pct = (s / maxSpeedup) * 100;
              return (
                <tr key={c} style={{ fontWeight: c === N ? 600 : 400, background: c === N ? "var(--accent-bg)" : undefined }}>
                  <td className="mono-cell">{c}</td>
                  <td className="mono-cell" style={{ color: "var(--accent)" }}>{s.toFixed(4)}×</td>
                  <td className="mono-cell">{(e * 100).toFixed(2)}%</td>
                  <td className="mono-cell">{pct.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", padding: "0.3rem 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
