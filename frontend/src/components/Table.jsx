// Responsive card grid that lists use cases
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Table({ useCases }) {
  const navigate = useNavigate();
  const [brokenImagesById, setBrokenImagesById] = useState({});

  const normalize = (value) => String(value || "").trim();

  const toInitials = (domainValue) => {
    const domain = normalize(domainValue);
    if (!domain) {
      return "NA";
    }
    const parts = domain
      .split(/\s+/)
      .map((word) => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("");
    return (parts || domain.slice(0, 2)).toUpperCase();
  };

  const truncate = (value, maxLength = 120) => {
    const text = normalize(value);
    if (!text) {
      return "";
    }
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 1)}...`;
  };

  const parseTechStack = (value) =>
    normalize(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {useCases.map((useCase) => (
        <article
          key={useCase.id}
          className="flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-card-hover motion-reduce:transition-none motion-reduce:transform-none"
        >
          <div className="flex items-start gap-3">
            {normalize(useCase.domain_image_url) && !brokenImagesById[useCase.id] ? (
              <img
                src={normalize(useCase.domain_image_url)}
                alt={`${normalize(useCase.domain) || "Domain"} thumbnail`}
                className="h-12 w-12 shrink-0 rounded-lg border border-border/80 object-cover"
                onError={() => setBrokenImagesById((current) => ({ ...current, [useCase.id]: true }))}
              />
            ) : (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-semibold text-on-solid shadow-glow-brand"
                aria-label="Domain initials fallback"
              >
                {toInitials(useCase.domain)}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-semibold text-ink">{normalize(useCase.title) || "Untitled use case"}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Domain</p>
              <p className="truncate text-ink">{normalize(useCase.domain) || "Unknown domain"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Client / Company</p>
              <p className="truncate text-ink">{normalize(useCase.client_name) || "Not provided"}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Description</p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink">
              {truncate(useCase.description, 150) || "No description available yet."}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Technology Stack</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {parseTechStack(useCase.technology_stack).length > 0 ? (
                parseTechStack(useCase.technology_stack).map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1 font-mono text-xs font-medium text-ink"
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted">Not specified</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/use-cases/${useCase.id}`)}
            className="mt-auto w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-ink transition-all duration-200 ease-out hover:border-border-strong motion-reduce:transition-none"
          >
            View Details
          </button>
        </article>
      ))}
    </div>
  );
}

export default Table;
