// ─────────────────────────────────────────────────────────────────────────────
// components/Navbar.tsx
// Top navigation bar for the COA project.
// ─────────────────────────────────────────────────────────────────────────────

interface NavbarProps {
  /** Currently active page id */
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_LINKS = [
  { id: "home",    label: "Home" },
  { id: "theory",  label: "Theory" },
  { id: "analysis", label: "Analysis" },
  { id: "about",   label: "About" },
];

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <button
            id="nav-logo"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700
                            flex items-center justify-center text-white font-bold text-sm
                            group-hover:scale-110 transition-transform duration-200">
              COA
            </div>
            <span className="hidden sm:block font-semibold text-slate-200 text-sm
                             group-hover:text-white transition-colors">
              Flash Sale Analysis
            </span>
          </button>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                id={`nav-${link.id}`}
                onClick={() => onNavigate(link.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activePage === link.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }
                `}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
