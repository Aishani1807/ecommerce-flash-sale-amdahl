// ─────────────────────────────────────────────────────────────────────────────
// App.tsx
// Root application component — simple state-based page router.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Navbar      from "./components/Navbar";
import HomePage    from "./pages/HomePage";
import TheoryPage  from "./pages/TheoryPage";
import AnalysisPage from "./pages/AnalysisPage";
import AboutPage   from "./pages/AboutPage";

type PageId = "home" | "theory" | "analysis" | "about";

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("home");

  const handleNavigate = (page: string) => {
    setActivePage(page as PageId);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main>
        {activePage === "home"     && <HomePage    onNavigate={handleNavigate} />}
        {activePage === "theory"   && <TheoryPage  />}
        {activePage === "analysis" && <AnalysisPage />}
        {activePage === "about"    && <AboutPage   />}
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-700/60 bg-slate-900/80 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6
                        flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            COA Project — E-Commerce Flash Sale Performance Analysis Using Amdahl&apos;s Law
          </p>
          <p className="text-slate-600 text-xs">
            Built with React + TypeScript + Vite + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
