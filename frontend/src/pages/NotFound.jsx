// Simple 404 page shown for unknown routes
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page-enter flex min-h-screen flex-col items-center justify-center gap-3 bg-app px-6 text-center">
      <p className="font-display text-7xl font-bold text-transparent [background:linear-gradient(135deg,rgb(var(--color-primary))_0%,rgb(var(--color-primary-text))_100%)] [background-clip:text] [-webkit-background-clip:text]">404</p>
      <p className="text-sm text-muted">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-solid shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-glow-primary motion-reduce:transition-none motion-reduce:transform-none"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
