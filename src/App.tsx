// ─────────────────────────────────────────────────────────────────────────────
// App.tsx
// Root component — simple state-based router with 5 navigation sections.
//
// Phase 3: parallelFraction is lifted to App so the Calculator and Graphs pages
// share the same P value without introducing a heavy state library.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Navbar         from "./components/Navbar";
import OverviewPage   from "./pages/OverviewPage";
import CalculatorPage from "./pages/CalculatorPage";
import GraphsPage     from "./pages/GraphsPage";
import ComparisonPage from "./pages/ComparisonPage";
import AboutPage      from "./pages/AboutPage";

type PageId = "overview" | "calculator" | "graphs" | "comparison" | "about";

/** Default parallel fraction — matches the project scenario (P = 0.85) */
const DEFAULT_P = 0.85;

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("overview");
  // Shared parallel fraction: controlled here, passed to Calculator and Graphs.
  const [parallelFraction, setParallelFraction] = useState<number>(DEFAULT_P);

  const handleNavigate = (page: string) => {
    setActivePage(page as PageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main>
        {activePage === "overview"    && <OverviewPage   onNavigate={handleNavigate} />}
        {activePage === "calculator"  && (
          <CalculatorPage
            sharedP={parallelFraction}
            onSharedPChange={setParallelFraction}
          />
        )}
        {activePage === "graphs"      && (
          <GraphsPage
            parallelFraction={parallelFraction}
            onParallelFractionChange={setParallelFraction}
          />
        )}
        {activePage === "comparison"  && (
          <ComparisonPage
            sharedP={parallelFraction}
            onSharedPChange={setParallelFraction}
          />
        )}
        {activePage === "about"       && <AboutPage onNavigate={handleNavigate} />}
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          marginTop: "3rem",
          padding: "1rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1100,
          marginLeft: "auto",
          marginRight: "auto",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <p style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
          E-Commerce Flash Sale: Performance Analysis Using Amdahl's Law — COA Project
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
          React · TypeScript · Vite · Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
