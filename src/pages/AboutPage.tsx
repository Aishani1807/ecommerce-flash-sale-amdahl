// ─────────────────────────────────────────────────────────────────────────────
// pages/AboutPage.tsx
// Project information, authors, and tech stack summary.
// ─────────────────────────────────────────────────────────────────────────────

const TECH_STACK = [
  { name: "React 19",     desc: "UI component library",          color: "text-cyan-400"   },
  { name: "TypeScript",   desc: "Type-safe JavaScript",          color: "text-blue-400"   },
  { name: "Vite",         desc: "Lightning-fast build tool",     color: "text-yellow-400" },
  { name: "Tailwind CSS", desc: "Utility-first CSS framework",   color: "text-teal-400"   },
  { name: "Recharts",     desc: "Composable charting library",   color: "text-purple-400" },
  { name: "Vitest",       desc: "Unit testing framework",        color: "text-green-400"  },
];

const PROJECT_OBJECTIVES = [
  "Demonstrate Amdahl's Law through an interactive, visual application",
  "Model a realistic e-commerce order-processing system during peak load",
  "Show how parallel fraction and core count affect theoretical speedup",
  "Illustrate the concept of diminishing returns in parallel computing",
  "Present clear calculations verifiable by hand or calculator",
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="mb-10 animate-fade-in-up">
        <span className="badge bg-green-500/20 text-green-300 mb-3">About</span>
        <h1 className="text-3xl font-extrabold text-white mb-2">Project Overview</h1>
        <p className="text-slate-400">
          Computer Organisation &amp; Architecture (COA) — Academic project
        </p>
      </header>

      {/* ── Project Card ────────────────────────────────────────────── */}
      <div className="card p-8 mb-8">
        <h2 className="text-xl font-bold text-white mb-1">
          E-Commerce Flash Sale: Performance Analysis Using Amdahl&apos;s Law
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          An interactive web application that applies computer architecture theory to a
          real-world e-commerce scenario.
        </p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Project Objectives
        </h3>
        <ul className="space-y-2">
          {PROJECT_OBJECTIVES.map((obj) => (
            <li key={obj} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-blue-400 mt-0.5 flex-shrink-0">✓</span>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Tech Stack ──────────────────────────────────────────────── */}
      <div className="card p-8 mb-8">
        <h2 className="text-lg font-bold text-white mb-6">Technology Stack</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-3 bg-slate-900/50 rounded-lg
                         border border-slate-700 px-4 py-3"
            >
              <div className={`text-sm font-bold font-mono ${tech.color} min-w-[8rem]`}>
                {tech.name}
              </div>
              <div className="text-xs text-slate-400">{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scenario Parameters ─────────────────────────────────────── */}
      <div className="card p-8">
        <h2 className="text-lg font-bold text-white mb-4">Scenario Parameters</h2>
        <div className="font-mono text-sm space-y-2">
          <ParamRow label="Parallel fraction (P)" value="0.85  (85 %)" color="text-green-400" />
          <ParamRow label="Serial fraction (S)"   value="0.15  (15 %)" color="text-orange-400" />
          <ParamRow label="Core configurations"   value="4, 16, 64"    color="text-blue-400"  />
          <ParamRow label="Expected speedup @ 4"  value="≈ 2.7586×"    color="text-slate-300" />
          <ParamRow label="Expected speedup @ 16" value="≈ 4.9231×"    color="text-slate-300" />
          <ParamRow label="Expected speedup @ 64" value="≈ 6.1244×"    color="text-slate-300" />
          <ParamRow label="Max theoretical"       value="≈ 6.6667×"    color="text-orange-400" />
        </div>
      </div>

    </div>
  );
}

// ── Helper ───────────────────────────────────────────────────────────────────
function ParamRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-700/40 pb-1.5">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}
