// Responsive card grid that lists use cases
import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { prefetchUseCaseById } from "../services/useCaseService";

function Table({ useCases }) {
  const navigate = useNavigate();
  const [brokenImagesById, setBrokenImagesById] = useState({});

  const openUseCaseDetails = (id) => {
    navigate(`/use-cases/${id}`);
  };

  const handleCardKeyDown = (event, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openUseCaseDetails(id);
    }
  };

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
      const description = normalize(useCase.description) || "No description available yet.";
      const parsedUpdatedAt = useCase.updated_at ? new Date(String(useCase.updated_at).replace(" ", "T")) : null;
      const updatedLabel = parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
        ? parsedUpdatedAt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
        : "N/A";
      return {
        raw: useCase,
        title,
        domain,
        client,
        imageUrl,
        description,
        updatedLabel,
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
            role="button"
            tabIndex={0}
            aria-label={`Open use case ${item.title}`}
            onMouseEnter={() => prefetchUseCaseById(useCase.id)}
            onFocus={() => prefetchUseCaseById(useCase.id)}
            onTouchStart={() => prefetchUseCaseById(useCase.id)}
            onClick={() => openUseCaseDetails(useCase.id)}
            onKeyDown={(event) => handleCardKeyDown(event, useCase.id)}
            className="ui-card flex cursor-pointer flex-col gap-3 overflow-hidden p-4 outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary"
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
              <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-ink">{item.title}</h3>
              <div className="mt-1 text-xs text-muted">
                <p><span className="font-medium text-ink">Domain:</span> {item.domain}</p>
                <p><span className="font-medium text-ink">Client:</span> {item.client}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-ink/90">{item.description}</p>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2">
            <p className="text-[11px] text-muted">Updated {item.updatedLabel}</p>
            <button
              type="button"
              onMouseEnter={() => prefetchUseCaseById(useCase.id)}
              onClick={(event) => {
                event.stopPropagation();
                openUseCaseDetails(useCase.id);
              }}
              className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-ink transition-all duration-200 ease-out hover:border-border-strong motion-reduce:transition-none"
            >
              View Details
            </button>
          </div>
        </article>
        );
      })}
    </div>
  );
}

export default memo(Table);
