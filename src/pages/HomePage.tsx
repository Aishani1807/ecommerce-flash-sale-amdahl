// ─────────────────────────────────────────────────────────────────────────────
// pages/HomePage.tsx
// Landing page for the COA project — hero section + scenario overview.
// ─────────────────────────────────────────────────────────────────────────────

import { FLASH_SALE_SCENARIO, EXPECTED_RESULTS, EXPECTED_MAX_SPEEDUP } from "../utils/constants";
import { formatSpeedup, formatPercent } from "../utils/formatters";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="text-center mb-16 animate-fade-in-up">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30
                        text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Computer Organisation &amp; Architecture Project
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white
                       leading-tight mb-6">
          E-Commerce Flash Sale
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r
                           from-blue-400 to-blue-600">
            Performance Analysis
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Using <strong className="text-slate-200">Amdahl&apos;s Law</strong> to determine the
          theoretical maximum speedup of a parallel order-processing system during a high-traffic
          flash sale event.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="hero-btn-analysis"
            onClick={() => onNavigate("analysis")}
            className="btn-primary animate-pulse-glow"
          >
            View Analysis →
          </button>
          <button
            id="hero-btn-theory"
            onClick={() => onNavigate("theory")}
            className="btn-secondary"
          >
            Learn the Theory
          </button>
        </div>
      </section>

      {/* ── Scenario Stats ───────────────────────────────────────────── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        <StatCard
          id="stat-parallel"
          label="Parallel Fraction"
          value={formatPercent(FLASH_SALE_SCENARIO.parallelFraction)}
          color="text-green-400"
          sub="Can run on multiple cores"
        />
        <StatCard
          id="stat-serial"
          label="Serial Fraction"
          value={formatPercent(1 - FLASH_SALE_SCENARIO.parallelFraction)}
          color="text-orange-400"
          sub="Must run sequentially"
        />
        <StatCard
          id="stat-max-speedup"
          label="Max Theoretical Speedup"
          value={formatSpeedup(EXPECTED_MAX_SPEEDUP, 4)}
          color="text-blue-400"
          sub="As cores → ∞"
        />
        <StatCard
          id="stat-cores"
          label="Core Configurations"
          value={FLASH_SALE_SCENARIO.cores.join(" / ")}
          color="text-purple-400"
          sub="4, 16, and 64 cores"
        />
      </section>

      {/* ── Scenario Description ─────────────────────────────────────── */}
      <section className="card p-8 mb-12">
        <h2 className="section-title">📦 The Scenario</h2>
        <p className="section-subtitle">What we are modelling</p>
        <p className="text-slate-300 leading-relaxed mb-6">
          {FLASH_SALE_SCENARIO.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <InfoBox
            title="⚡ Parallelisable Work (85 %)"
            items={[
              "Inventory stock lookup",
              "Payment validation",
              "Fraud detection",
              "Fulfilment routing",
            ]}
            accent="blue"
          />
          <InfoBox
            title="🔒 Serial Work (15 %)"
            items={[
              "Final order confirmation",
              "Sequential database commit",
              "Order ID generation",
              "Audit log write",
            ]}
            accent="orange"
          />
        </div>
      </section>

      {/* ── Quick Results Preview ────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="section-title text-center mb-2">Expected Results</h2>
        <p className="section-subtitle text-center">
          Theoretical speedup at each core configuration
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {EXPECTED_RESULTS.map((r) => (
            <div
              key={r.cores}
              id={`preview-${r.cores}cores`}
              className="card p-6 text-center hover:border-blue-500/50 transition-colors duration-300"
            >
              <p className="text-slate-400 text-sm mb-1">{r.cores} Cores</p>
              <p className="text-3xl font-bold text-blue-400 font-mono">
                {formatSpeedup(r.speedup)}
              </p>
              <p className="text-xs text-slate-500 mt-1">theoretical speedup</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

// ── Reusable sub-components ──────────────────────────────────────────────────
interface StatCardProps {
  id: string;
  label: string;
  value: string;
  color: string;
  sub: string;
}

function StatCard({ id, label, value, color, sub }: StatCardProps) {
  return (
    <div id={id} className="card p-5 text-center hover:border-slate-600 transition-colors">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

interface InfoBoxProps {
  title: string;
  items: string[];
  accent: "blue" | "orange";
}

function InfoBox({ title, items, accent }: InfoBoxProps) {
  const border = accent === "blue" ? "border-blue-500/30" : "border-orange-500/30";
  const bg     = accent === "blue" ? "bg-blue-500/5"      : "bg-orange-500/5";
  const dot    = accent === "blue" ? "bg-blue-400"         : "bg-orange-400";

  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <p className="font-semibold text-white text-sm mb-3">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
