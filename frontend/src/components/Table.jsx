// Responsive card grid that lists use cases
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function Table({ useCases, onDelete }) {
  const navigate = useNavigate();

  // Format a date string into a short readable form
  const formatDate = (value) => {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {useCases.map((useCase) => (
        <article key={useCase.id} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-ink">{useCase.title}</h3>
            <StatusBadge status={useCase.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Domain</p>
              <p className="truncate text-ink">{useCase.domain}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Client</p>
              <p className="truncate text-ink">{useCase.client_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Deploy URL</p>
              {useCase.deployment_url ? (
                <a href={useCase.deployment_url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                  Open
                </a>
              ) : (
                <p className="text-muted">N/A</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">File URL</p>
              {useCase.resource_url ? (
                <a href={useCase.resource_url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                  Open
                </a>
              ) : (
                <p className="text-muted">N/A</p>
              )}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
            <p className="font-mono text-xs text-muted">Updated {formatDate(useCase.updated_at)}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/use-cases/${useCase.id}`)}
                className="rounded-md px-2 py-1 text-xs font-medium text-ink hover:bg-slate-100"
              >
                Details
              </button>
              <button
                onClick={() => navigate(`/use-cases/${useCase.id}/edit`)}
                className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary-light"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(useCase)}
                className="rounded-md px-2 py-1 text-xs font-medium text-danger hover:bg-danger-light"
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default Table;
