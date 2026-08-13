// Sidebar navigation shown on the left of every page
import { memo } from "react";
import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { type: "heading", label: "Dashboard", adminOnly: true },
  { to: "/dashboard/overview", label: "Overview", icon: "grid", adminOnly: true },
  { to: "/domain-media", label: "Domain Media", icon: "chart", adminOnly: true },
  { type: "heading", label: "Repository" },
  { to: "/use-cases", label: "Browse Use Cases", icon: "list" },
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
  if (name === "chart") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 20h16" />
        <rect x="6" y="11" width="3" height="6" rx="1" />
        <rect x="11" y="7" width="3" height="10" rx="1" />
        <rect x="16" y="4" width="3" height="13" rx="1" />
      </svg>
    );
  }
  if (name === "pulse") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 12 7 12 10 6 14 18 17 12 21 12" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
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
  const { isAdmin } = useAuth();
  const reduceMotion = useReducedMotion();
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <motion.aside
      className="app-shell-sidebar flex-col"
      initial={reduceMotion ? false : { x: -34, opacity: 0 }}
      animate={reduceMotion ? {} : { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* Brand mark */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient font-display text-sm font-bold text-on-solid shadow-glow-brand">
          EK
        </div>
        <span className="font-display text-sm font-semibold text-sidebar-active">Use Case Repository</span>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-col gap-1">
        {visibleItems.map((item) => {
          if (item.type === "heading") {
            return (
              <p key={item.label} className="mt-2 px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-text/80 first:mt-0">
                {item.label}
              </p>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-l-2 border-l-primary bg-sidebar-active-bg text-sidebar-active shadow-glow-primary"
                    : "border-l-2 border-l-transparent text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-active"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !reduceMotion ? (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-md border border-primary/25 bg-sidebar-active-bg"
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    />
                  ) : null}
                  <span className={`relative z-10 inline-flex ${isActive ? "text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.45)]" : ""}`}>
                    <Icon name={item.icon} />
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </motion.aside>
  );
}

export default memo(Sidebar);
