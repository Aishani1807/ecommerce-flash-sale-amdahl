// ─────────────────────────────────────────────────────────────────────────────
// pages/CalculatorPage.tsx
// Phase 2: Fully functional Amdahl's Law Speedup Calculator.
//
// All arithmetic is delegated to src/calculations/amdahl.ts — this file
// contains only UI logic and rendering.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  calculateSpeedup,
  calculateMaxSpeedup,
  calculateRelativeTime,
  buildCalculationSteps,
  buildResultsTable,
} from "../calculations/amdahl";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_P  = 0.85;
const DEFAULT_N  = 4;

/** Core counts shown in preset buttons and the full results table */
const TABLE_CORES = [1, 4, 16, 32, 64, 128, 256];

/** Core counts used in the "main results" summary row */
const SUMMARY_CORES = [4, 16, 64];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Clamp parallel fraction to [0, 1] and keep full float precision */
function clampP(raw: number): number {
  return Math.min(1, Math.max(0, raw));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [P, setP] = useState<number>(DEFAULT_P);
  const [N, setN] = useState<number>(DEFAULT_N);

  // Derived values — computed from the calculation module, never hardcoded
  const serialFraction  = 1 - P;
  const speedupAtN      = calculateSpeedup(P, N);
  const relTimeAtN      = calculateRelativeTime(P, N);
  const maxSpeedup      = calculateMaxSpeedup(P);
  const steps           = buildCalculationSteps(P, N);
  const tableRows       = buildResultsTable(P, TABLE_CORES);
  const summaryRows     = buildResultsTable(P, SUMMARY_CORES);

  function handlePSlider(e: React.ChangeEvent<HTMLInputElement>) {
    setP(clampP(parseFloat(e.target.value)));
  }

  function handleReset() {
    setP(DEFAULT_P);
    setN(DEFAULT_N);
  }

  // Validate a typed core count
  function handleCoreInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (Number.isFinite(val) && val > 0) setN(val);
  }

  return (
    <div className="page-container--wide">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.2rem" }}>
          Speedup Calculator
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Amdahl's Law — S(N) = 1 / ((1 − P) + P/N) — applied to the
          e-commerce order-processing workload.
        </p>
      </section>

      {/* ── Input controls + live result ─────────────────────────────── */}
      <div
        style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}
        className="sm:grid-cols-2"
      >
        {/* Inputs */}
        <div className="panel">
          <h2 className="section-heading">Inputs</h2>

          {/* Parallel fraction slider */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <label
                htmlFor="input-parallel-fraction"
                style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}
              >
                Parallel fraction (P)
              </label>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem", color: "var(--accent)", fontWeight: 700 }}>
                {(P * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="input-parallel-fraction"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={P}
              onChange={handlePSlider}
              style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
              aria-label="Parallel fraction slider"
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>
              <span>0% — fully serial</span>
              <span>100% — fully parallel</span>
            </div>
          </div>

          {/* Serial fraction display (auto-computed) */}
          <div
            style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "0.82rem", padding: "0.35rem 0",
              borderBottom: "1px solid var(--border)",
              marginBottom: "1.1rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Serial fraction (1 − P) — auto</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text)", fontWeight: 600 }}>
              {(serialFraction * 100).toFixed(0)}%
            </span>
          </div>

          {/* Core count — typed input */}
          <div style={{ marginBottom: "0.875rem" }}>
            <label
              htmlFor="input-core-count"
              style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.35rem" }}
            >
              Number of cores (N)
            </label>
            <input
              id="input-core-count"
              type="number"
              min={1}
              max={4096}
              value={N}
              onChange={handleCoreInput}
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
              aria-label="Number of cores"
            />
          </div>

          {/* Core preset buttons */}
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quick select
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {TABLE_CORES.map((c) => (
                <button
                  key={c}
                  id={`preset-cores-${c}`}
                  onClick={() => setN(c)}
                  aria-pressed={N === c}
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "JetBrains Mono, monospace",
                    padding: "0.2rem 0.55rem",
                    borderRadius: 3,
                    border: N === c ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: N === c ? "var(--accent-bg)" : "var(--surface)",
                    color: N === c ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer",
                    fontWeight: N === c ? 700 : 400,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            id="btn-reset"
            onClick={handleReset}
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.35rem 0.85rem",
              borderRadius: 4,
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            ↺ Reset to defaults (P = 85%, N = 4)
          </button>
        </div>

        {/* Live results */}
        <div className="panel">
          <h2 className="section-heading">Live Result — S({N})</h2>

          {/* Big speedup number */}
          <div
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: 5,
              padding: "1rem 1.25rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", marginBottom: "0.3rem" }}>
              Speedup S({N})
            </p>
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "2.2rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
              {speedupAtN.toFixed(8)}×
            </p>
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              1 / ({serialFraction.toFixed(8)} + {(P / N).toFixed(8)})
            </p>
          </div>

          <KVRow label="Parallel fraction P"               value={P.toFixed(8)} />
          <KVRow label="Serial fraction (1 − P)"           value={serialFraction.toFixed(8)} />
          <KVRow label="Cores N"                           value={String(N)} />
          <KVRow label="Parallel exec time (P/N)"          value={(P / N).toFixed(8)} />
          <KVRow label="Total relative exec time"          value={relTimeAtN.toFixed(8)} />
          <KVRow label="Core efficiency (S/N × 100%)"      value={`${(speedupAtN / N * 100).toFixed(4)}%`} />
          <KVRow
            label="Maximum theoretical speedup (1/(1−P))"
            value={P >= 1 ? "Unbounded (∞)" : calculateMaxSpeedup(P).toFixed(8) + "×"}
            highlight
          />
        </div>
      </div>

      {/* ── Main results summary (4 / 16 / 64 / max) ─────────────────── */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h2 className="section-heading">
          Main Results at P = {(P * 100).toFixed(0)}%
          <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--text-faint)", marginLeft: "0.75rem" }}>
            reference configuration cores: 4, 16, 64
          </span>
        </h2>
        <div
          style={{ display: "grid", gap: "0.75rem" }}
          className="sm:grid-cols-4"
        >
          {summaryRows.map((r) => (
            <SummaryCard
              key={r.cores}
              label={`${r.cores} cores`}
              speedup={r.speedup}
              active={N === r.cores}
            />
          ))}
          <SummaryCard
            label="Maximum (N → ∞)"
            speedup={maxSpeedup}
            isMax
            active={false}
          />
        </div>
      </div>

      {/* ── Step-by-step calculation ──────────────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h2 className="section-heading">Step-by-Step Calculation — N = {N}, P = {P.toFixed(2)}</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "3.5rem" }}>Step</th>
              <th>Description</th>
              <th>Expression</th>
              <th style={{ width: "12rem" }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.step} style={{ background: s.step === 5 ? "var(--accent-bg)" : undefined }}>
                <td className="mono-cell" style={{ fontWeight: 600 }}>{s.step}</td>
                <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{s.label}</td>
                <td className="mono-cell" style={{ fontSize: "0.78rem" }}>{s.expr}</td>
                <td
                  className="mono-cell"
                  style={{ fontWeight: s.step === 5 ? 700 : 400, color: s.step === 5 ? "var(--accent)" : "var(--text)" }}
                >
                  {s.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Full results table ────────────────────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1rem", overflowX: "auto" }}>
        <h2 className="section-heading">
          Full Results Table — P = {(P * 100).toFixed(0)}%
        </h2>
        <table className="data-table" style={{ minWidth: "46rem" }}>
          <thead>
            <tr>
              <th>Cores (N)</th>
              <th>Serial time (1−P)</th>
              <th>Parallel time (P/N)</th>
              <th>Total exec time</th>
              <th>Speedup S(N)</th>
              <th>Efficiency (S/N × 100%)</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r) => (
              <tr
                key={r.cores}
                style={{
                  fontWeight: r.cores === N ? 600 : 400,
                  background: r.cores === N ? "var(--accent-bg)" : undefined,
                }}
              >
                <td className="mono-cell">{r.cores}</td>
                <td className="mono-cell">{r.serialTime.toFixed(8)}</td>
                <td className="mono-cell">{r.parallelTime.toFixed(8)}</td>
                <td className="mono-cell">{r.totalTime.toFixed(8)}</td>
                <td className="mono-cell" style={{ color: "var(--accent)", fontWeight: r.cores === N ? 700 : 500 }}>
                  {r.speedup.toFixed(8)}×
                </td>
                <td className="mono-cell">{(r.efficiency * 100).toFixed(4)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>
          Selected core count (N = {N}) is highlighted. All values use full floating-point precision; rounding for display only.
        </p>
      </div>

      {/* ── Maximum speedup derivation ────────────────────────────────── */}
      <div className="panel">
        <h2 className="section-heading">Maximum Theoretical Speedup — Derivation</h2>

        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.875rem", lineHeight: 1.75 }}>
          As N → ∞, the parallel execution time P/N approaches zero.
          The formula reduces to:
        </p>

        <div className="formula-block" style={{ marginBottom: "0.875rem" }}>
          S_max = lim(N→∞) S(N) = 1 / ((1 − P) + 0) = 1 / (1 − P)
        </div>

        {P < 1 ? (
          <>
            <div className="formula-block" style={{ marginBottom: "1rem" }}>
              At P = {P.toFixed(8)}: &nbsp; S_max = 1 / (1 − {P.toFixed(8)}) = 1 / {serialFraction.toFixed(8)} = {calculateMaxSpeedup(P).toFixed(8)}×
            </div>
            <div
              style={{
                background: "var(--accent-bg)",
                border: "1px solid var(--accent-border)",
                borderRadius: 5,
                padding: "0.75rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                lineHeight: 1.75,
              }}
            >
              <strong style={{ color: "var(--text)" }}>Why the serial portion is the bottleneck:</strong>{" "}
              The serial fraction ({(serialFraction * 100).toFixed(0)}%) must always execute on a single core,
              regardless of how many cores are available. Even with infinite cores, those cores cannot
              reduce the serial portion's execution time. Adding cores beyond a certain point yields
              negligible additional speedup — the serial {(serialFraction * 100).toFixed(0)}% always dominates.
            </div>
          </>
        ) : (
          <div
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: 5,
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
            }}
          >
            At P = 100%: the serial fraction is zero, so the maximum theoretical speedup is{" "}
            <strong style={{ color: "var(--accent)" }}>unbounded (∞)</strong>. This is a theoretical
            construct — in practice, no real workload is 100% parallelisable.
          </div>
        )}
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Key-value row in the live results panel */
function KVRow({
  label, value, highlight = false,
}: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.8rem",
        padding: "0.28rem 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ color: "var(--text-muted)", paddingRight: "0.5rem" }}>{label}</span>
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontWeight: highlight ? 700 : 500,
          color: highlight ? "var(--accent)" : "var(--text)",
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** Summary card for 4 / 16 / 64 cores and max speedup */
function SummaryCard({
  label, speedup, isMax = false, active,
}: {
  label: string;
  speedup: number;
  isMax?: boolean;
  active: boolean;
}) {
  const displayValue = isMax
    ? speedup === Infinity
      ? "Unbounded"
      : speedup.toFixed(8) + "×"
    : speedup.toFixed(8) + "×";

  return (
    <div
      style={{
        border: active
          ? "1px solid var(--accent)"
          : isMax
          ? "1px solid var(--border-strong)"
          : "1px solid var(--border)",
        borderRadius: 5,
        padding: "0.75rem 1rem",
        background: active ? "var(--accent-bg)" : "var(--surface)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)", marginBottom: "0.3rem" }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--accent)",
          lineHeight: 1,
          wordBreak: "break-all",
        }}
      >
        {displayValue}
      </p>
    </div>
  );
}
