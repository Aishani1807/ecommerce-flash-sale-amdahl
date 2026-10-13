// ─────────────────────────────────────────────────────────────────────────────
// pages/ComparisonPage.tsx
// Phase 4: Server Comparison & Recommendation Simulator
//
// Implements:
//   - Workload scenario selector (three fixed scenarios + current shared P)
//   - Server configuration comparison table (4/16/32/64/128 cores)
//   - Optional cost / power assumptions panel
//   - Transparent recommendation engine output
//
// All arithmetic is delegated to src/calculations/comparison.ts.
// This file contains only UI logic and rendering.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  WORKLOAD_SCENARIOS,
  buildComparisonTable,
  calculateCostResult,
  hasSufficientCostData,
  generateRecommendation,
  isValidCostInput,
} from "../calculations/comparison";
import { calculateMaxSpeedup } from "../calculations/amdahl";
import type { CostAssumptions, ComparisonRow, CostResult } from "../types/comparison";

// ── Props ─────────────────────────────────────────────────────────────────────

interface ComparisonPageProps {
  /** Shared parallel fraction from App-level state */
  sharedP?: number;
  /** Callback to update shared parallel fraction across App */
  onSharedPChange?: (p: number) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCostField(raw: string): number | null {
  const v = parseFloat(raw);
  return raw.trim() === "" || !Number.isFinite(v) || v <= 0 ? null : v;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ComparisonPage({ sharedP, onSharedPChange }: ComparisonPageProps = {}) {
  // ── Scenario selection ───────────────────────────────────────────────────
  // Default scenario is p85. If sharedP matches one of the named scenarios, sync with it.
  const matchingScenario = sharedP !== undefined
    ? WORKLOAD_SCENARIOS.find((s) => Math.abs(s.parallelFraction - sharedP) < 0.0001)
    : undefined;

  const [scenarioId, setScenarioId] = useState<string>("p85");

  // Determine active scenario ID: if sharedP is provided and does not match a named scenario, use "custom"
  const activeScenarioId = scenarioId === "custom"
    ? "custom"
    : (matchingScenario ? matchingScenario.id : scenarioId);

  // Raw string states for cost inputs (so the user can clear fields)
  const [costRaw, setCostRaw] = useState({
    monthlyCostUsd:        "",
    powerWatts:            "",
    electricityUsdPerKwh:  "",
    hoursPerDay:           "",
  });
  const [showCostPanel, setShowCostPanel] = useState(false);

  // ── Derive active parallel fraction ───────────────────────────────────────
  const activeScenario = WORKLOAD_SCENARIOS.find((s) => s.id === activeScenarioId);
  const P: number = activeScenarioId === "custom" && sharedP !== undefined
    ? sharedP
    : (activeScenario?.parallelFraction ?? (sharedP ?? 0.85));

  function handleScenarioSelect(id: string) {
    setScenarioId(id);
    const scenario = WORKLOAD_SCENARIOS.find((s) => s.id === id);
    if (scenario && onSharedPChange) {
      onSharedPChange(scenario.parallelFraction);
    }
  }

  const maxSpeedup = calculateMaxSpeedup(P);
  const isUnbounded = !isFinite(maxSpeedup);

  // ── Build table rows ─────────────────────────────────────────────────────
  const rows: ComparisonRow[] = buildComparisonTable(P);

  // ── Cost analysis ─────────────────────────────────────────────────────────
  const costAssumptions: CostAssumptions = {
    monthlyCostUsd:        parseCostField(costRaw.monthlyCostUsd),
    powerWatts:            parseCostField(costRaw.powerWatts),
    electricityUsdPerKwh:  parseCostField(costRaw.electricityUsdPerKwh),
    hoursPerDay:           parseCostField(costRaw.hoursPerDay),
  };
  const hasCost = showCostPanel && hasSufficientCostData(costAssumptions);

  const costResults: (CostResult | null)[] = rows.map((r) =>
    hasCost ? calculateCostResult(r.speedup, costAssumptions) : null
  );

  // ── Recommendation ────────────────────────────────────────────────────────
  const recommendation = generateRecommendation(rows, costResults, P, hasCost);

  return (
    <div className="page-container--wide">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
          Server Comparison &amp; Recommendation
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          A CTO decision-support tool comparing server configurations under Amdahl's Law.
          Results are <strong>theoretical performance estimates</strong>, not real server benchmarks.
        </p>
      </section>

      {/* ── Workload scenario selector ────────────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="section-heading">Workload Scenario</h2>

        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.875rem" }}>
          Select the proportion of your flash-sale workload that can be parallelised.
          The serial portion limits the benefit of adding more cores — this is Amdahl's Law.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.875rem" }}>
          {WORKLOAD_SCENARIOS.map((s) => (
            <button
              key={s.id}
              id={`scenario-btn-${s.id}`}
              onClick={() => handleScenarioSelect(s.id)}
              aria-pressed={activeScenarioId === s.id}
              style={{
                fontSize: "0.82rem",
                padding: "0.3rem 0.85rem",
                borderRadius: 4,
                border: activeScenarioId === s.id
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border-strong)",
                background: activeScenarioId === s.id ? "var(--accent-bg)" : "var(--surface)",
                color: activeScenarioId === s.id ? "var(--accent)" : "var(--text-muted)",
                fontWeight: activeScenarioId === s.id ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}

          {sharedP !== undefined && (
            <button
              id="scenario-btn-custom"
              onClick={() => setScenarioId("custom")}
              aria-pressed={activeScenarioId === "custom"}
              style={{
                fontSize: "0.82rem",
                padding: "0.3rem 0.85rem",
                borderRadius: 4,
                border: activeScenarioId === "custom"
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border-strong)",
                background: activeScenarioId === "custom" ? "var(--accent-bg)" : "var(--surface)",
                color: activeScenarioId === "custom" ? "var(--accent)" : "var(--text-muted)",
                fontWeight: activeScenarioId === "custom" ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {matchingScenario ? "Custom" : `Custom P (${(sharedP * 100).toFixed(0)}%)`}
            </button>
          )}
        </div>

        {/* Active scenario summary */}
        <div
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            borderRadius: 4,
            padding: "0.6rem 1rem",
            fontSize: "0.82rem",
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <span>
            <span style={{ color: "var(--text-faint)", marginRight: "0.35rem" }}>Parallel fraction P:</span>
            <strong style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--accent)" }}>
              {(P * 100).toFixed(0)}%
            </strong>
          </span>
          <span>
            <span style={{ color: "var(--text-faint)", marginRight: "0.35rem" }}>Serial fraction (1−P):</span>
            <strong style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text)" }}>
              {((1 - P) * 100).toFixed(0)}%
            </strong>
          </span>
          <span>
            <span style={{ color: "var(--text-faint)", marginRight: "0.35rem" }}>Max theoretical speedup:</span>
            <strong style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text)" }}>
              {isUnbounded ? "unbounded (∞)" : maxSpeedup.toFixed(4) + "×"}
            </strong>
          </span>
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>
          Maximum theoretical speedup = 1 / (1 − P). The serial {((1 - P) * 100).toFixed(0)}% cannot be
          parallelised, so no number of cores can exceed this ceiling.
        </p>
      </div>

      {/* ── Comparison table ──────────────────────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1.25rem", overflowX: "auto" }}>
        <h2 className="section-heading">Server Configuration Comparison — P = {(P * 100).toFixed(0)}%</h2>

        <table className="data-table" style={{ minWidth: "52rem" }}>
          <thead>
            <tr>
              <th>Cores (N)</th>
              <th>Speedup S(N)</th>
              <th>Parallel efficiency</th>
              <th>% of max speedup</th>
              <th>Relative exec time</th>
              <th>Gain vs 4-core</th>
              {hasCost && <th>Est. monthly cost</th>}
              {hasCost && <th>Speedup / $100</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isRec = r.cores === recommendation.recommendedCores;
              const cr = costResults[i];
              return (
                <tr
                  key={r.cores}
                  id={`comparison-row-${r.cores}`}
                  style={{
                    background: isRec ? "var(--accent-bg)" : undefined,
                    fontWeight: isRec ? 600 : 400,
                  }}
                >
                  <td className="mono-cell">
                    {r.cores}
                    {isRec && (
                      <span
                        style={{
                          marginLeft: "0.4rem",
                          fontSize: "0.68rem",
                          color: "var(--accent)",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        ★ rec.
                      </span>
                    )}
                  </td>
                  <td className="mono-cell" style={{ color: "var(--accent)" }}>
                    {r.speedup.toFixed(4)}×
                  </td>
                  <td className="mono-cell">
                    {(r.efficiency * 100).toFixed(2)}%
                  </td>
                  <td className="mono-cell">
                    {r.pctOfMax.toFixed(1)}%
                  </td>
                  <td className="mono-cell">
                    {r.relativeExecTime.toFixed(2)}%
                  </td>
                  <td className="mono-cell" style={{ color: r.marginalGainOver4 > 0 ? "var(--text)" : "var(--text-faint)" }}>
                    {r.cores === 4 ? "—" : `+${r.marginalGainOver4.toFixed(1)}%`}
                  </td>
                  {hasCost && (
                    <td className="mono-cell">
                      {cr && cr.totalMonthlyCost !== null
                        ? `$${cr.totalMonthlyCost.toFixed(2)}`
                        : <span style={{ color: "var(--text-faint)" }}>—</span>}
                    </td>
                  )}
                  {hasCost && (
                    <td className="mono-cell">
                      {cr && cr.speedupPerDollar !== null
                        ? (cr.speedupPerDollar * 100).toFixed(4) + "×"
                        : <span style={{ color: "var(--text-faint)" }}>—</span>}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.6rem", lineHeight: 1.7 }}>
          <p>
            <strong>Relative exec time:</strong> execution time expressed as a percentage of single-core
            time (baseline = 100%). Lower is faster.
          </p>
          <p>
            <strong>Gain vs 4-core:</strong> percentage improvement in speedup compared with the 4-core
            configuration. The 4-core row is the baseline (—).
          </p>
          {hasCost && (
            <p>
              <strong>Est. monthly cost</strong> and <strong>Speedup / $100</strong> are calculated
              from your own assumptions below — they are not verified market prices.
            </p>
          )}
        </div>
      </div>

      {/* ── Cost assumptions panel ────────────────────────────────────── */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showCostPanel ? "0.875rem" : 0 }}>
          <h2 className="section-heading" style={{ margin: 0, paddingBottom: 0, borderBottom: "none" }}>
            Cost &amp; Power Assumptions
            <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--text-faint)", marginLeft: "0.6rem" }}>
              optional
            </span>
          </h2>
          <button
            id="btn-toggle-cost-panel"
            onClick={() => setShowCostPanel((v) => !v)}
            style={{
              fontSize: "0.78rem",
              padding: "0.25rem 0.7rem",
              borderRadius: 4,
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {showCostPanel ? "Hide" : "Show assumptions"}
          </button>
        </div>

        {showCostPanel && (
          <>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Enter your own estimated values. These inputs are assumptions only — no real server
              prices or electricity rates are claimed here. Leave any field blank to exclude it
              from the analysis.
            </p>

            <div
              style={{
                display: "grid",
                gap: "0.75rem",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                marginBottom: "0.875rem",
              }}
            >
              <CostField
                id="cost-monthly-server"
                label="Monthly server cost (USD)"
                unit="USD / month"
                value={costRaw.monthlyCostUsd}
                onChange={(v) => setCostRaw((c) => ({ ...c, monthlyCostUsd: v }))}
                placeholder="e.g. 500"
              />
              <CostField
                id="cost-power-watts"
                label="Power consumption"
                unit="Watts"
                value={costRaw.powerWatts}
                onChange={(v) => setCostRaw((c) => ({ ...c, powerWatts: v }))}
                placeholder="e.g. 200"
              />
              <CostField
                id="cost-electricity-rate"
                label="Electricity price"
                unit="USD / kWh"
                value={costRaw.electricityUsdPerKwh}
                onChange={(v) => setCostRaw((c) => ({ ...c, electricityUsdPerKwh: v }))}
                placeholder="e.g. 0.12"
              />
              <CostField
                id="cost-hours-per-day"
                label="Operating hours"
                unit="hours / day"
                value={costRaw.hoursPerDay}
                onChange={(v) => setCostRaw((c) => ({ ...c, hoursPerDay: v }))}
                placeholder="e.g. 24"
              />
            </div>

            {/* Electricity formula note */}
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-faint)",
                background: "var(--mono-bg)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "0.5rem 0.75rem",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: "0.5rem",
              }}
            >
              Monthly electricity = (Watts ÷ 1000) × hours/day × 30 days × USD/kWh
            </div>

            {/* Validation feedback */}
            {!hasSufficientCostData(costAssumptions) && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-faint)", fontStyle: "italic" }}>
                Cost analysis unavailable — provide a monthly server cost or all three electricity fields
                (power, rate, hours).
              </p>
            )}

            {hasSufficientCostData(costAssumptions) && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                ✓ Sufficient inputs provided. The table above now includes cost columns
                and the recommendation incorporates cost data.
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Recommendation ────────────────────────────────────────────── */}
      <div
        className="panel"
        style={{ marginBottom: "1.25rem", borderLeft: "3px solid var(--accent)" }}
      >
        <h2 className="section-heading">Recommendation</h2>

        {/* Performance-only notice */}
        {recommendation.performanceOnly && (
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-faint)",
              background: "var(--mono-bg)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "0.45rem 0.75rem",
              marginBottom: "0.875rem",
            }}
          >
            Performance-only recommendation — cost analysis unavailable. A financially optimal
            choice cannot be determined without reliable cost and workload information.
            {!showCostPanel && " Open the assumptions panel above to add cost data."}
          </div>
        )}

        {/* Headline */}
        <p
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: "0.75rem",
          }}
        >
          {recommendation.headline}
        </p>

        {/* Evidence */}
        <div style={{ marginBottom: "0.875rem" }}>
          <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)", marginBottom: "0.4rem" }}>
            Supporting metrics
          </p>
          <ul
            style={{
              paddingLeft: "1.1rem",
              fontSize: "0.83rem",
              color: "var(--text-muted)",
              lineHeight: 1.9,
            }}
          >
            {recommendation.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>

        {/* Next config note */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "0.75rem",
            marginBottom: "0.875rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)", marginBottom: "0.35rem" }}>
            Next larger configuration
          </p>
          <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.75 }}>
            {recommendation.nextConfigNote}
          </p>
        </div>

        {/* Deployment caveats */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)", marginBottom: "0.4rem" }}>
            What you should measure before deployment
          </p>
          <ul
            style={{
              paddingLeft: "1.1rem",
              fontSize: "0.8rem",
              color: "var(--text-faint)",
              lineHeight: 1.9,
            }}
          >
            {recommendation.deploymentCaveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Diminishing-returns note ──────────────────────────────────── */}
      <div className="panel">
        <h2 className="section-heading">Why More Cores Have Diminishing Returns</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "0.75rem" }}>
          Under Amdahl's Law, the serial fraction ({((1 - P) * 100).toFixed(0)}%) of the workload must
          always execute on a single core. No matter how many cores are added, this serial work cannot
          be reduced. As a result:
        </p>
        <ul style={{ fontSize: "0.875rem", color: "var(--text-muted)", paddingLeft: "1.25rem", lineHeight: 2 }}>
          <li>
            Moving from 4 → 16 cores adds{" "}
            <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>
              +{rows[1]?.marginalGainOver4.toFixed(1)}%
            </strong>{" "}
            speedup.
          </li>
          <li>
            Moving from 4 → 32 cores adds{" "}
            <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>
              +{rows[2]?.marginalGainOver4.toFixed(1)}%
            </strong>{" "}
            speedup.
          </li>
          <li>
            Moving from 4 → 64 cores adds{" "}
            <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>
              +{rows[3]?.marginalGainOver4.toFixed(1)}%
            </strong>{" "}
            speedup.
          </li>
          <li>
            Moving from 4 → 128 cores adds{" "}
            <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>
              +{rows[4]?.marginalGainOver4.toFixed(1)}%
            </strong>{" "}
            speedup.
          </li>
        </ul>
        <p style={{ fontSize: "0.82rem", color: "var(--text-faint)", marginTop: "0.75rem", lineHeight: 1.75 }}>
          The speedup ceiling for this scenario is{" "}
          <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {isUnbounded ? "∞ (fully parallel)" : maxSpeedup.toFixed(4) + "×"}
          </strong>.
          Beyond about 64 cores, each additional core provides a progressively smaller
          fraction of that ceiling — a consequence of the {((1 - P) * 100).toFixed(0)}% serial
          bottleneck that no hardware can eliminate.
        </p>
        <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>
          This is a theoretical model. Actual workload behaviour depends on memory bandwidth,
          thread synchronisation, cache contention, OS scheduling, and other factors not
          captured by Amdahl's Law alone.
        </p>
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** A single labelled cost input field */
function CostField({
  id,
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const parsed = parseCostField(value);
  const invalid = value.trim() !== "" && !isValidCostInput(parsed);

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--text)",
          display: "block",
          marginBottom: "0.25rem",
        }}
      >
        {label}
        <span style={{ fontWeight: 400, color: "var(--text-faint)", marginLeft: "0.3rem" }}>
          ({unit})
        </span>
      </label>
      <input
        id={id}
        type="number"
        min={0}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "0.35rem 0.625rem",
          fontSize: "0.875rem",
          fontFamily: "JetBrains Mono, monospace",
          border: invalid
            ? "1px solid #dc2626"
            : "1px solid var(--border-strong)",
          borderRadius: 4,
          background: "var(--surface)",
          color: "var(--text)",
          outline: "none",
        }}
      />
      {invalid && (
        <p style={{ fontSize: "0.68rem", color: "#dc2626", marginTop: "0.2rem" }}>
          Must be a positive number
        </p>
      )}
    </div>
  );
}
