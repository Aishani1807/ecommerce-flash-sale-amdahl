// ─────────────────────────────────────────────────────────────────────────────
// components/Navbar.tsx
// Top navigation bar — compact, light-themed, academic style.
// ─────────────────────────────────────────────────────────────────────────────

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_LINKS = [
  { id: "overview",    label: "Overview" },
  { id: "calculator",  label: "Speedup Calculator" },
  { id: "graphs",      label: "Performance Graphs" },
  { id: "comparison",  label: "Server Comparison" },
  { id: "about",       label: "About the Project" },
];

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #dde1e7",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "3.25rem",
          gap: "1rem",
        }}
      >
        {/* Brand */}
        <button
          id="nav-logo"
          onClick={() => onNavigate("overview")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#2563eb",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 4,
              padding: "0.15rem 0.45rem",
              letterSpacing: "0.04em",
            }}
          >
            COA
          </span>
          <span
            style={{
              fontSize: "0.825rem",
              fontWeight: 600,
              color: "#1e2330",
              whiteSpace: "nowrap",
            }}
            className="hidden sm:inline"
          >
            Flash Sale Analysis
          </span>
        </button>

        {/* Nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.15rem",
            overflowX: "auto",
            flexShrink: 1,
          }}
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              id={`nav-${link.id}`}
              onClick={() => onNavigate(link.id)}
              className={`nav-link${activePage === link.id ? " nav-link--active" : ""}`}
              style={{ whiteSpace: "nowrap" }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
