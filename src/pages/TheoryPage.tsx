// ─────────────────────────────────────────────────────────────────────────────
// pages/TheoryPage.tsx
// Explains Amdahl's Law step-by-step for a student audience.
// ─────────────────────────────────────────────────────────────────────────────

import FormulaCard from "../components/FormulaCard";

export default function TheoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <header className="mb-10 animate-fade-in-up">
        <span className="badge bg-purple-500/20 text-purple-300 mb-3">COA Theory</span>
        <h1 className="text-3xl font-extrabold text-white mb-2">Amdahl&apos;s Law</h1>
        <p className="text-slate-400">
          A foundational principle in computer architecture for quantifying the benefit
          of parallel execution.
        </p>
      </header>

      {/* Formula card */}
      <div className="mb-10 animate-fade-in-up">
        <FormulaCard />
      </div>

      {/* Explanation sections */}
      <div className="space-y-8">

        <Section title="1. What is Amdahl's Law?">
          <p>
            Proposed by <strong className="text-slate-200">Gene Amdahl in 1967</strong>,
            Amdahl&apos;s Law calculates the theoretical maximum speedup achievable when
            only part of a program can be parallelised.
          </p>
          <p className="mt-3">
            The key insight is that <strong className="text-slate-200">serial portions
            limit overall speedup</strong>, regardless of how many processors are added.
          </p>
        </Section>

        <Section title="2. The Variables">
          <ul className="space-y-3">
            <VariableRow symbol="P" color="text-green-400"
              desc="Parallel fraction — the proportion of the program that can run simultaneously on multiple cores. In our scenario: 0.85 (85 %)." />
            <VariableRow symbol="S" color="text-orange-400"
              desc="Serial fraction — the proportion that must run sequentially. S = 1 − P. In our scenario: 0.15 (15 %)." />
            <VariableRow symbol="n" color="text-blue-400"
              desc="Number of processors (CPU cores). Increasing n reduces the parallel portion's execution time." />
          </ul>
        </Section>

        <Section title="3. Step-by-Step Calculation (4 Cores)">
          <ol className="space-y-3 list-decimal list-inside text-slate-300">
            <StepLi>
              Identify <code className="mono-code">P = 0.85</code>,{" "}
              <code className="mono-code">S = 0.15</code>,{" "}
              <code className="mono-code">n = 4</code>
            </StepLi>
            <StepLi>
              Apply formula:{" "}
              <code className="mono-code">Speedup = 1 / (S + P/n)</code>
            </StepLi>
            <StepLi>
              Substitute:{" "}
              <code className="mono-code">= 1 / (0.15 + 0.85/4)</code>
            </StepLi>
            <StepLi>
              Simplify:{" "}
              <code className="mono-code">= 1 / (0.15 + 0.2125) = 1 / 0.3625</code>
            </StepLi>
            <StepLi>
              Result:{" "}
              <code className="mono-code text-blue-400 font-bold">≈ 2.7586×</code>
            </StepLi>
          </ol>
        </Section>

        <Section title="4. Diminishing Returns">
          <p className="text-slate-300">
            As we add more cores, each additional core contributes <em>less</em> additional
            speedup. This is because the serial fraction becomes the dominant bottleneck.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            {[
              { cores: 4,   speedup: "2.7586×", delta: "—" },
              { cores: 16,  speedup: "4.9231×", delta: "+2.16×" },
              { cores: 64,  speedup: "6.1244×", delta: "+1.20×" },
              { cores: "∞", speedup: "6.6667×", delta: "+0.54×" },
            ].map((r) => (
              <div key={String(r.cores)}
                className="bg-slate-900/60 rounded-lg border border-slate-700 p-3">
                <p className="text-slate-400 text-xs">{r.cores} cores</p>
                <p className="font-mono font-bold text-white mt-1">{r.speedup}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.delta}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="5. Key Takeaway">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-slate-200">
              🔑 Even with <strong>infinite cores</strong>, the maximum speedup is bounded
              by <code className="mono-code">1 / S = 1 / 0.15 ≈ 6.67×</code>.
              Adding more CPUs beyond a certain point gives negligible improvement —
              the serial 15 % always dominates.
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <div className="text-slate-300 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function VariableRow({ symbol, color, desc }: { symbol: string; color: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <code className={`font-mono font-bold text-lg ${color} min-w-[1.5rem]`}>{symbol}</code>
      <span className="text-slate-300 text-sm">{desc}</span>
    </li>
  );
}

function StepLi({ children }: { children: React.ReactNode }) {
  return <li className="text-slate-300 text-sm">{children}</li>;
}
