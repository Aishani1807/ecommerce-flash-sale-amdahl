// ─────────────────────────────────────────────────────────────────────────────
// components/FormulaCard.tsx
// Displays the Amdahl's Law formula in a styled card with colour-coded parts.
// ─────────────────────────────────────────────────────────────────────────────

export default function FormulaCard() {
  return (
    <div className="card p-6 text-center">
      <h3 className="text-lg font-semibold text-slate-300 mb-4">
        Amdahl&apos;s Law Formula
      </h3>

      {/* Main formula */}
      <div className="bg-slate-900/60 rounded-xl p-5 mb-4 border border-slate-700">
        <p className="font-mono text-2xl sm:text-3xl font-semibold tracking-wide text-white">
          <span className="text-blue-400">Speedup</span>
          <span className="text-slate-400">(n)</span>
          {" = "}
          <span className="text-slate-300">1 /</span>
          {"("}
          <span className="text-orange-400">S</span>
          {" + "}
          <span className="text-green-400">P</span>
          <span className="text-slate-400"> / n</span>
          {")"}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <LegendItem color="text-orange-400" symbol="S" label="Serial fraction (0.15 = 15 %)" />
        <LegendItem color="text-green-400"  symbol="P" label="Parallel fraction (0.85 = 85 %)" />
        <LegendItem color="text-slate-300"  symbol="n" label="Number of CPU cores" />
      </div>

      {/* Max speedup note */}
      <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <p className="text-sm text-orange-300">
          <strong>Maximum Speedup</strong> (as n → ∞):{" "}
          <code className="font-mono">1 / S = 1 / 0.15 ≈ 6.6667×</code>
        </p>
      </div>
    </div>
  );
}

// ── Small legend item ────────────────────────────────────────────────────────
function LegendItem({ color, symbol, label }: { color: string; symbol: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className={`font-mono font-bold ${color} text-base`}>{symbol}</code>
      <span className="text-slate-400">= {label}</span>
    </div>
  );
}
