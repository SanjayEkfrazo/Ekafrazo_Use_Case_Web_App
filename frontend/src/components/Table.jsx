// Responsive card grid that lists use cases
import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { prefetchUseCaseById } from "../services/useCaseService";

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

  const preparedUseCases = useMemo(
    () => useCases.map((useCase) => {
      const title = normalize(useCase.title) || "Untitled use case";
      const domain = normalize(useCase.domain) || "Unknown";
      const client = normalize(useCase.client_name) || "Not specified";
      const imageUrl = normalize(useCase.domain_image_url);
      const description = truncate(useCase.description, 135) || "No description available yet.";
      const parsedUpdatedAt = useCase.updated_at ? new Date(String(useCase.updated_at).replace(" ", "T")) : null;
      const updatedLabel = parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
        ? parsedUpdatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "N/A";
      const allTechItems = normalize(useCase.technology_stack)
        .split(/[,;|\n]+/)
        .map((item) => item.trim())
        .filter(Boolean);
      const techItems = allTechItems.slice(0, 3);

      return {
        raw: useCase,
        title,
        domain,
        client,
        imageUrl,
        description,
        updatedLabel,
        techItems,
        extraTechCount: Math.max(allTechItems.length - techItems.length, 0),
      };
    }),
    [useCases]
  );

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {preparedUseCases.map((item) => {
        const useCase = item.raw;

        return (
        <article
          key={useCase.id}
          onMouseEnter={() => prefetchUseCaseById(useCase.id)}
          onFocus={() => prefetchUseCaseById(useCase.id)}
          onTouchStart={() => prefetchUseCaseById(useCase.id)}
          className="ui-card flex flex-col gap-3 overflow-hidden p-4 motion-reduce:transition-none"
        >
          <div className="flex items-start gap-3">
            {item.imageUrl && !brokenImagesById[useCase.id] ? (
              <img
                src={item.imageUrl}
                alt={`${item.domain} thumbnail`}
                className="h-12 w-12 shrink-0 rounded-lg border border-border/80 object-cover"
                loading="lazy"
                decoding="async"
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
              <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{item.title}</h3>
              <div className="mt-1 grid grid-cols-1 gap-0.5 text-xs text-muted sm:grid-cols-2 sm:gap-x-2">
                <p className="truncate"><span className="font-medium text-ink">Domain:</span> {item.domain}</p>
                <p className="truncate"><span className="font-medium text-ink">Client:</span> {item.client}</p>
              </div>
            </div>
            <span className="ml-auto rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[10px] font-medium text-muted">
              Updated {item.updatedLabel}
            </span>
          </div>

          <div className="min-h-[2.7rem]">
            <p className="line-clamp-2 text-sm leading-[1.35rem] text-ink">
              {item.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
              {item.techItems.length > 0 ? (
                <>
                  {item.techItems.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-2.5 py-1 font-mono text-[11px] font-medium text-ink"
                  >
                    {tech}
                  </span>
                  ))}
                  {item.extraTechCount > 0 && (
                    <span className="inline-flex items-center rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-muted">
                      +{item.extraTechCount} more
                    </span>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">Not provided</p>
              )}
          </div>

          <button
            type="button"
            onMouseEnter={() => prefetchUseCaseById(useCase.id)}
            onClick={() => navigate(`/use-cases/${useCase.id}`)}
            className="mt-auto w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-ink transition-all duration-200 ease-out hover:border-border-strong motion-reduce:transition-none"
          >
            View Details
          </button>
        </article>
        );
      })}
    </div>
  );
}

export default memo(Table);
