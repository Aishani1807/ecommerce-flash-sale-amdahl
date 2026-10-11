// ─────────────────────────────────────────────────────────────────────────────
// pages/AnalysisPage.tsx
// Interactive analysis page — runs calculations and shows chart + table.
// (Phase 0 version: stub chart placeholder; full Recharts chart in Phase 1)
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { runAmdahlAnalysis } from "../calculations/amdahl";
import { FLASH_SALE_SCENARIO } from "../utils/constants";
import { formatSpeedup } from "../utils/formatters";
import ResultsTable from "../components/ResultsTable";
import FormulaCard from "../components/FormulaCard";

export default function AnalysisPage() {
  // Run the analysis using the flash sale scenario constants
  const analysis = useMemo(
    () =>
      runAmdahlAnalysis({
        parallelFraction: FLASH_SALE_SCENARIO.parallelFraction,
        cores: FLASH_SALE_SCENARIO.cores,
      }),
    []
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="mb-10 animate-fade-in-up">
        <span className="badge bg-blue-500/20 text-blue-300 mb-3">Live Analysis</span>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Performance Analysis
        </h1>
        <p className="text-slate-400">
          Computed results for the e-commerce flash sale scenario using Amdahl&apos;s Law.
        </p>
      </header>

      {/* ── Formula ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <FormulaCard />
      </div>

      {/* ── Key Metric Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {analysis.results.map((r) => (
          <div
            key={r.cores}
            id={`metric-${r.cores}cores`}
            className="card p-5 text-center hover:border-blue-500/40 transition-colors duration-300"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              {r.cores} Cores
            </p>
            <p className="text-3xl font-bold font-mono text-blue-400">
              {formatSpeedup(r.speedup)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Eff: {(r.efficiency * 100).toFixed(1)} %
            </p>
          </div>
        ))}
        <div
          id="metric-max"
          className="card p-5 text-center border-orange-500/30 hover:border-orange-500/50
                     transition-colors duration-300"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Max (∞ cores)
          </p>
          <p className="text-3xl font-bold font-mono text-orange-400">
            {formatSpeedup(analysis.maxTheoreticalSpeedup)}
          </p>
          <p className="text-xs text-slate-500 mt-1">theoretical limit</p>
        </div>
      </div>

      {/* ── Chart Placeholder (full chart arrives in Phase 1) ─────────── */}
      <div className="card p-6 mb-8 text-center border-dashed border-slate-600">
        <div className="py-12 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center
                          justify-center text-2xl">
            📊
          </div>
          <p className="font-semibold text-slate-300">Interactive Speedup Chart</p>
          <p className="text-sm text-slate-500">
            Full Recharts line graph will be added in <strong className="text-slate-400">Phase 1</strong>.
          </p>
        </div>
      </div>

      {/* ── Results Table ────────────────────────────────────────────── */}
      <ResultsTable
        results={analysis.results}
        maxSpeedup={analysis.maxTheoreticalSpeedup}
      />

    </div>
  );
}
