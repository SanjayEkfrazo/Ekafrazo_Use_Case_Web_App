// Sidebar navigation shown on the left of every page
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "grid" },
  { to: "/use-cases", label: "Use Cases", icon: "list" },
];

// Small inline icon renderer so we avoid adding an icon library dependency
function Icon({ name }) {
  if (name === "grid") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col bg-sidebar px-4 py-6 md:flex">
      {/* Brand mark */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-white">
          EK
        </div>
        <span className="font-display text-sm font-semibold text-white">Use Cases</span>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-sidebar-hover text-sidebar-active" : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-active"
              }`
            }
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
