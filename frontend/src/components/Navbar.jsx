// Top navigation bar shown above the page content

function Navbar({ title, subtitle, compact = false }) {
  return (
    <header className={`border-b border-border bg-surface ${compact ? "px-5 py-3 md:px-6" : "px-6 py-5 md:px-8"}`}>
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className={`text-sm text-muted ${compact ? "mt-0.5" : ""}`}>{subtitle}</p>}
    </header>
  );
}

export default Navbar;
