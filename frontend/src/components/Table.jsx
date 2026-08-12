// Responsive card grid that lists use cases
import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDomainMedia, prefetchUseCaseById } from "../services/useCaseService";
import ImageCarousel from "./ImageCarousel";

function Table({ useCases }) {
  const navigate = useNavigate();
  const [domainMediaByDomain, setDomainMediaByDomain] = useState({});
  const [syncStep, setSyncStep] = useState(0);

  useEffect(() => {
    const periodMs = 2000;

    let intervalId;
    let timeoutId;

    const startSyncedTicker = () => {
      setSyncStep(Math.floor(Date.now() / periodMs));

      const now = Date.now();
      const nextBoundaryDelay = periodMs - (now % periodMs);

      timeoutId = setTimeout(() => {
        setSyncStep(Math.floor(Date.now() / periodMs));
        intervalId = setInterval(() => {
          setSyncStep(Math.floor(Date.now() / periodMs));
        }, periodMs);
      }, nextBoundaryDelay);
    };

    startSyncedTicker();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  const domainKey = (value) => String(value || "").trim().toLowerCase();

  useEffect(() => {
    let isCancelled = false;

    async function loadDomainMedia() {
      const domains = Array.from(new Set(useCases.map((item) => String(item?.domain || "").trim()).filter(Boolean)));
      if (domains.length === 0) {
        setDomainMediaByDomain({});
        return;
      }

      try {
        const response = await fetchDomainMedia({ domains });
        if (isCancelled) {
          return;
        }

        const grouped = {};
        (response?.data || []).forEach((entry) => {
          const key = domainKey(entry.domain);
          if (!key) {
            return;
          }

          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(String(entry.image_url || "").trim());
        });

        if (Object.keys(grouped).length === 0) {
          const domainResults = await Promise.all(
            domains.map(async (domain) => {
              try {
                const perDomain = await fetchDomainMedia({ domain });
                return [domain, perDomain?.data || []];
              } catch (_error) {
                return [domain, []];
              }
            })
          );

          domainResults.forEach(([domain, rows]) => {
            const key = domainKey(domain);
            if (!key) {
              return;
            }
            grouped[key] = (rows || []).map((entry) => String(entry.image_url || "").trim()).filter(Boolean);
          });
        }

        setDomainMediaByDomain(grouped);
      } catch (_error) {
        if (!isCancelled) {
          setDomainMediaByDomain({});
        }
      }
    }

    loadDomainMedia();

    return () => {
      isCancelled = true;
    };
  }, [useCases]);

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
      const description = normalize(useCase.description) || "No description available yet.";
      const parsedUpdatedAt = useCase.updated_at ? new Date(String(useCase.updated_at).replace(" ", "T")) : null;
      const updatedLabel = parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
        ? parsedUpdatedAt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
        : "N/A";
      return {
        raw: useCase,
        title,
        domain,
        domainKey: domainKey(useCase.domain),
        client,
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
            className="ui-card flex min-h-[330px] cursor-pointer flex-col gap-3 overflow-hidden p-3 outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="h-40">
              {domainMediaByDomain[item.domainKey]?.length > 0 ? (
                <ImageCarousel
                  images={domainMediaByDomain[item.domainKey]}
                  altBase={`${item.domain} visual`}
                  className="h-full"
                  autoPlayMs={2000}
                  syncStep={syncStep}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface-elevated">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-semibold text-on-solid shadow-glow-brand"
                    aria-label="Domain initials fallback"
                  >
                    {toInitials(useCase.domain)}
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-ink">{item.title}</h3>
              <div className="mt-1 text-xs text-muted">
                <p><span className="font-medium text-ink">Domain:</span> {item.domain}</p>
                <p><span className="font-medium text-ink">Client:</span> {item.client}</p>
              </div>
            </div>

            <p className="line-clamp-3 text-sm text-ink/90">{truncate(item.description, 140)}</p>
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
