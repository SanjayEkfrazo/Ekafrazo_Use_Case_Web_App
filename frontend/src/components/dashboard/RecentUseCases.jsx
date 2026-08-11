import { memo } from "react";
import Button from "../Button";
import { prefetchUseCaseById } from "../../services/useCaseService";

function RecentUseCases({ items, onOpenDetails, formatDate, className = "", maxItems = 6, dense = false }) {
  const visibleItems = items.slice(0, maxItems);

  return (
    <section className={`flex min-h-0 flex-col rounded-2xl border border-border bg-surface shadow-card ${dense ? "p-3" : "p-4 md:p-5"} ${className}`}>
      <div className={`${dense ? "mb-2" : "mb-3"} flex items-end justify-between`}>
        <div>
          <h3 className="font-display text-base font-semibold text-ink">Recently Updated Use Cases</h3>
          <p className={`${dense ? "mt-0.5" : "mt-1"} text-xs text-muted`}>Latest updates across domains and clients.</p>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">No recent updates yet.</p>
      ) : (
        <div className={`panel-scrollbar min-h-0 flex-1 overflow-y-auto pr-1 ${dense ? "space-y-1.5" : "space-y-2"}`}>
            {visibleItems.map((item) => (
            <article
              key={item.id}
              onMouseEnter={() => prefetchUseCaseById(item.id)}
              onFocus={() => prefetchUseCaseById(item.id)}
              onTouchStart={() => prefetchUseCaseById(item.id)}
              className={`rounded-xl border border-border bg-surface-elevated shadow-card transition-all duration-200 hover:border-border-strong motion-reduce:transition-none ${dense ? "p-2" : "p-2.5"}`}
            >
              <div className={`flex items-start ${dense ? "gap-2" : "gap-2.5"}`}>
                <div className={`flex-shrink-0 overflow-hidden rounded-lg border border-border bg-app ${dense ? "h-10 w-10" : "h-12 w-12"}`}>
                  {item.domain_image_url ? (
                    <img src={item.domain_image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-hero-glow text-[10px] font-medium text-muted">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`${dense ? "text-xs" : "text-sm"} line-clamp-1 font-semibold text-ink`}>{item.title}</p>
                  <p className={`text-xs text-muted ${dense ? "mt-0" : "mt-0.5"}`}>{item.domain || "Unknown domain"} • {item.client_name || "Client not specified"}</p>
                  <p className={`text-[11px] text-muted ${dense ? "mt-0.5" : "mt-1"}`}>Updated {formatDate(item.updated_at)}</p>
                </div>

                <Button className={dense ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"} variant="secondary" onClick={() => onOpenDetails(item.id)}>
                  {dense ? "Open" : "View Details"}
                </Button>
              </div>
            </article>
            ))}
        </div>
      )}
    </section>
  );
}

export default memo(RecentUseCases);
