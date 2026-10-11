// ─────────────────────────────────────────────────────────────────────────────
// components/PerformanceGraphs.tsx
// Phase 3: Three interactive Recharts line charts for Amdahl's Law visualisation.
//
// All speedup values are computed via the existing calculation module.
// No formulas are duplicated here — only chart rendering and data assembly.
// ─────────────────────────────────────────────────────────────────────────────

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { calculateSpeedup, calculateMaxSpeedup } from "../calculations/amdahl";
import { CHART_COLORS } from "../utils/constants";

// ── Shared constants ──────────────────────────────────────────────────────────

/** Core counts plotted on every chart — same as TABLE_CORES in CalculatorPage */
const CHART_CORES = [1, 4, 16, 32, 64, 128, 256];

/** X-axis tick formatter */
function coreLabel(n: number | string): string {
  return String(n);
}

/** Shared label formatter for all tooltips */
const labelFmt = (label: unknown): string => `Cores N = ${label}`;

/** Shared tooltip content style */
const tooltipStyle = {
  fontSize: "0.78rem",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
};

// ── Graph 1: Cores vs Speedup ────────────────────────────────────────────────

interface Graph1Props {
  /** Current parallel fraction from App state */
  parallelFraction: number;
}

export function Graph1CoresVsSpeedup({ parallelFraction }: Graph1Props) {
  const maxSpeedup  = calculateMaxSpeedup(parallelFraction);
  const isUnbounded = !isFinite(maxSpeedup);

  const data = CHART_CORES.map((n) => ({
    cores:   n,
    speedup: parseFloat(calculateSpeedup(parallelFraction, n).toFixed(4)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 4, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="cores"
          type="number"
          scale="log"
          domain={["dataMin", "dataMax"]}
          ticks={CHART_CORES}
          tickFormatter={coreLabel}
          label={{ value: "Number of CPU Cores (log\u2082 scale)", position: "insideBottom", offset: -4, fontSize: 11, fill: CHART_COLORS.axis }}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          height={40}
        />
        <YAxis
          label={{ value: "Speedup S(N)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: CHART_COLORS.axis }}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          domain={[0, isUnbounded ? 260 : Math.ceil(maxSpeedup + maxSpeedup * 0.15)]}
          width={52}
        />
        <Tooltip
          formatter={(val) => {
            const n = typeof val === "number" ? val : 0;
            return [`${n.toFixed(4)}\u00d7`, "Speedup S(N)"] as [string, string];
          }}
          labelFormatter={labelFmt}
          contentStyle={tooltipStyle}
        />
        <Legend iconType="line" wrapperStyle={{ fontSize: "0.78rem", paddingTop: "0.5rem" }} />
        {!isUnbounded && (
          <ReferenceLine
            y={parseFloat(maxSpeedup.toFixed(4))}
            stroke={CHART_COLORS.maxLine}
            strokeDasharray="5 4"
            label={{
              value: `S_max = ${maxSpeedup.toFixed(2)}\u00d7`,
              position: "insideTopRight",
              fontSize: 10,
              fill: CHART_COLORS.maxLine,
            }}
          />
        )}
        <Line
          name={`Amdahl speedup (P = ${(parallelFraction * 100).toFixed(0)}%)`}
          type="monotone"
          dataKey="speedup"
          stroke={CHART_COLORS.speedup}
          strokeWidth={2}
          dot={{ r: 3.5, fill: CHART_COLORS.speedup, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Graph 2: Ideal vs Actual Speedup ─────────────────────────────────────────

export function Graph2IdealVsActual({ parallelFraction }: Graph1Props) {
  const data = CHART_CORES.map((n) => ({
    cores:  n,
    ideal:  n,
    actual: parseFloat(calculateSpeedup(parallelFraction, n).toFixed(4)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 4, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="cores"
          type="number"
          scale="log"
          domain={["dataMin", "dataMax"]}
          ticks={CHART_CORES}
          tickFormatter={coreLabel}
          label={{ value: "Number of CPU Cores (log\u2082 scale)", position: "insideBottom", offset: -4, fontSize: 11, fill: CHART_COLORS.axis }}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          height={40}
        />
        <YAxis
          label={{ value: "Speedup", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: CHART_COLORS.axis }}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          domain={[0, 260]}
          width={52}
        />
        <Tooltip
          formatter={(val, name) => {
            const n    = typeof val === "number" ? val : 0;
            const label: string =
              name === "ideal"
                ? "Ideal S(N) = N"
                : `Amdahl S(N) (P = ${(parallelFraction * 100).toFixed(0)}%)`;
            return [`${n.toFixed(4)}\u00d7`, label] as [string, string];
          }}
          labelFormatter={labelFmt}
          contentStyle={tooltipStyle}
        />
        <Legend
          iconType="line"
          wrapperStyle={{ fontSize: "0.78rem", paddingTop: "0.5rem" }}
          formatter={(value) =>
            value === "ideal"
              ? "Ideal linear speedup: S(N) = N"
              : `Amdahl's Law (P = ${(parallelFraction * 100).toFixed(0)}%)`
          }
        />
        <Line
          name="ideal"
          type="monotone"
          dataKey="ideal"
          stroke={CHART_COLORS.idealSpeedup}
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={false}
        />
        <Line
          name="actual"
          type="monotone"
          dataKey="actual"
          stroke={CHART_COLORS.speedup}
          strokeWidth={2}
          dot={{ r: 3.5, fill: CHART_COLORS.speedup, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Graph 3: Serial Fraction Impact ──────────────────────────────────────────

interface Scenario {
  P:     number;
  label: string;
  color: string;
}

const SCENARIOS: Scenario[] = [
  { P: 0.85, label: "P = 85%, S = 15% (project default)", color: CHART_COLORS.scenario85 },
  { P: 0.90, label: "P = 90%, S = 10%",                   color: CHART_COLORS.scenario90 },
  { P: 0.95, label: "P = 95%, S = 5%",                    color: CHART_COLORS.scenario95 },
];

export function Graph3SerialFractionImpact() {
  const data = CHART_CORES.map((n) => {
    const row: Record<string, number> = { cores: n };
    SCENARIOS.forEach((s, idx) => {
      row[`s${idx}`] = parseFloat(calculateSpeedup(s.P, n).toFixed(4));
    });
    return row;
  });

  const yMax = Math.ceil(calculateMaxSpeedup(SCENARIOS[SCENARIOS.length - 1].P) + 2);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 4, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="cores"
          type="number"
          scale="log"
          domain={["dataMin", "dataMax"]}
          ticks={CHART_CORES}
          tickFormatter={coreLabel}
          label={{ value: "Number of CPU Cores (log\u2082 scale)", position: "insideBottom", offset: -4, fontSize: 11, fill: CHART_COLORS.axis }}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          height={40}
        />
        <YAxis
          label={{ value: "Speedup S(N)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: CHART_COLORS.axis }}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          domain={[0, yMax]}
          width={52}
        />
        <Tooltip
          formatter={(val, name) => {
            const num  = typeof val === "number" ? val : 0;
            const key  = String(name);
            const idx  = parseInt(key.replace("s", ""), 10);
            const disp = !isNaN(idx) && SCENARIOS[idx] ? SCENARIOS[idx].label : key;
            return [`${num.toFixed(4)}\u00d7`, disp] as [string, string];
          }}
          labelFormatter={labelFmt}
          contentStyle={tooltipStyle}
        />
        <Legend
          iconType="line"
          wrapperStyle={{ fontSize: "0.78rem", paddingTop: "0.5rem" }}
          formatter={(value) => {
            const idx = parseInt(String(value).replace("s", ""), 10);
            return !isNaN(idx) && SCENARIOS[idx] ? SCENARIOS[idx].label : value;
          }}
        />
        {SCENARIOS.map((s, idx) => {
          const max = calculateMaxSpeedup(s.P);
          return (
            <ReferenceLine
              key={`ref-${idx}`}
              y={parseFloat(max.toFixed(4))}
              stroke={s.color}
              strokeDasharray="4 4"
              strokeOpacity={0.45}
              label={{
                value:    `${(s.P * 100).toFixed(0)}%: ${max.toFixed(2)}\u00d7`,
                position: idx === 0 ? "insideTopLeft" : "insideTopRight",
                fontSize: 9.5,
                fill:     s.color,
              }}
            />
          );
        })}
        {SCENARIOS.map((s, idx) => (
          <Line
            key={`line-${idx}`}
            name={`s${idx}`}
            type="monotone"
            dataKey={`s${idx}`}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3.5, fill: s.color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
