// ─────────────────────────────────────────────────────────────────────────────
// components/ResultsTable.tsx
// Displays the per-core speedup and efficiency results in a styled table.
// ─────────────────────────────────────────────────────────────────────────────

import type { SpeedupResult } from "../types/amdahl";
import { formatSpeedup, formatEfficiency } from "../utils/formatters";

interface ResultsTableProps {
  results: SpeedupResult[];
  maxSpeedup: number;
}

export default function ResultsTable({ results, maxSpeedup }: ResultsTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Results Table</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Theoretical speedup &amp; efficiency per core configuration
          </p>
        </div>
        <div className="badge bg-orange-500/20 text-orange-300">
          Max: {formatSpeedup(maxSpeedup)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60 bg-slate-900/40">
              <Th>Cores (n)</Th>
              <Th>Speedup</Th>
              <Th>Efficiency</Th>
              <Th>Amdahl's Formula</Th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr
                key={row.cores}
                id={`result-row-${row.cores}`}
                className={`
                  border-b border-slate-700/40 transition-colors hover:bg-slate-700/30
                  ${idx % 2 === 0 ? "bg-slate-800/20" : ""}
                `}
              >
                {/* Cores */}
                <Td>
                  <span className="font-mono font-semibold text-blue-400">{row.cores}</span>
                </Td>

                {/* Speedup */}
                <Td>
                  <div className="flex items-center gap-2">
                    <SpeedupBar value={row.speedup} max={maxSpeedup} />
                    <span className="font-mono font-semibold text-white">
                      {formatSpeedup(row.speedup)}
                    </span>
                  </div>
                </Td>

                {/* Efficiency */}
                <Td>
                  <span className={`font-mono ${efficiencyColor(row.efficiency)}`}>
                    {formatEfficiency(row.efficiency)}
                  </span>
                </Td>

                {/* Formula expansion */}
                <Td>
                  <code className="text-xs text-slate-400 font-mono">
                    1 / (0.15 + 0.85/{row.cores}) = {formatSpeedup(row.speedup)}
                  </code>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Helper sub-components ────────────────────────────────────────────────────
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-6 py-4 text-slate-300">{children}</td>;
}

function SpeedupBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function efficiencyColor(efficiency: number): string {
  if (efficiency >= 0.7) return "text-green-400";
  if (efficiency >= 0.4) return "text-yellow-400";
  return "text-red-400";
}
