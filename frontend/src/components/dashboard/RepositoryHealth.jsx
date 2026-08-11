import { memo } from "react";
import { AlertTriangle, FileWarning, ImageOff, Link2Off } from "lucide-react";
import Button from "../Button";

const HEALTH_ICON_MAP = {
  deployment: Link2Off,
  presentation: FileWarning,
  image: ImageOff,
  incomplete: AlertTriangle,
};

function RepositoryHealth({ cards, needsAttention, onOpenDetails, onOpenLibrary, onReviewKind, className = "" }) {
  return (
    <section className={`flex min-h-0 flex-col rounded-2xl border border-warning/40 bg-warning-light/35 p-4 shadow-card md:p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Requires Attention</h3>
        </div>
        {onOpenLibrary && (
          <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={onOpenLibrary}>
            Browse Use Cases
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = HEALTH_ICON_MAP[card.kind] || AlertTriangle;
          return (
            <article key={card.kind} className="rounded-xl border border-warning/45 bg-surface/90 p-3 shadow-card">
              <div className="inline-flex rounded-lg bg-warning-light p-2 text-warning-text">
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <p className="mt-2.5 font-display text-2xl font-semibold leading-none tabular-nums text-warning-text">{card.count}</p>
              <p className="mt-1.5 text-xs font-semibold text-ink">{card.label}</p>
              <Button
                variant="secondary"
                className="mt-2.5 w-full px-2.5 py-1.5 text-xs"
                onClick={() => onReviewKind?.(card.kind)}
              >
                Review
              </Button>
            </article>
          );
        })}
      </div>

      <div className="mt-4 min-h-0 flex-1">
        <h4 className="text-sm font-semibold text-ink">Needs Attention</h4>
        {needsAttention.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No records need attention right now.</p>
        ) : (
          <div className="panel-scrollbar mt-2 max-h-full space-y-2 overflow-y-auto pr-1">
            {needsAttention.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-warning/40 bg-surface/90 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  <p className="text-xs text-muted">{item.domain || "Unknown"} • {item.client_name || "Unknown client"}</p>
                </div>
                <Button variant="secondary" className="px-3 py-1.5 text-xs sm:flex-shrink-0" onClick={() => onOpenDetails(item.id)}>
                  Review
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(RepositoryHealth);
