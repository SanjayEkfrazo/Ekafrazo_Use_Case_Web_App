// Simple 404 page shown for unknown routes
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-app text-center px-6">
      <p className="font-display text-5xl font-semibold text-ink">404</p>
      <p className="text-sm text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
