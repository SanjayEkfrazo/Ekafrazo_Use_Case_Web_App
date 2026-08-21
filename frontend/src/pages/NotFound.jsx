// Simple 404 page shown for unknown routes
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

function NotFound() {
  const location = useLocation();
  const invalidPath = location.pathname || "/";

  return (
    <div className="page-enter flex min-h-screen flex-col items-center justify-center gap-3 bg-app px-6 text-center">
      <p className="font-display text-7xl font-bold text-transparent [background:linear-gradient(135deg,rgb(var(--color-primary))_0%,rgb(var(--color-secondary))_100%)] [background-clip:text] [-webkit-background-clip:text]">404</p>
      <h1 className="font-display text-2xl font-semibold text-ink">Page Not Found</h1>
      <p className="max-w-xl text-sm text-muted">
        The requested URL was not found on this application. It may be misspelled, removed, or outdated.
      </p>
      <p className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-muted">
        Requested path: <span className="font-semibold text-ink">{invalidPath}</span>
      </p>
      <Link
        to="/use-cases"
        className="mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-solid shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-glow-primary motion-reduce:transition-none motion-reduce:transform-none"
      >
        Go to Use Cases
      </Link>
    </div>
  );
}

export default NotFound;
