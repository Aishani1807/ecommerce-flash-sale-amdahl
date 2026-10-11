// ─────────────────────────────────────────────────────────────────────────────
// App.tsx
// Root component — simple state-based router with 5 navigation sections.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Navbar         from "./components/Navbar";
import OverviewPage   from "./pages/OverviewPage";
import CalculatorPage from "./pages/CalculatorPage";
import GraphsPage     from "./pages/GraphsPage";
import ComparisonPage from "./pages/ComparisonPage";
import AboutPage      from "./pages/AboutPage";

type PageId = "overview" | "calculator" | "graphs" | "comparison" | "about";

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("overview");

  const handleNavigate = (page: string) => {
    setActivePage(page as PageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main>
        {activePage === "overview"    && <OverviewPage   onNavigate={handleNavigate} />}
        {activePage === "calculator"  && <CalculatorPage />}
        {activePage === "graphs"      && <GraphsPage />}
        {activePage === "comparison"  && <ComparisonPage />}
        {activePage === "about"       && <AboutPage />}
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
