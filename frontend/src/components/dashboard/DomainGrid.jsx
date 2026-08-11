import { memo } from "react";
import { ArrowUpRight, Cpu, Landmark, Stethoscope, ShoppingBag, Factory, Truck, GraduationCap, Circle } from "lucide-react";

const DOMAIN_ICONS = [
  Landmark,
  Stethoscope,
  ShoppingBag,
  Factory,
  Truck,
  GraduationCap,
  Cpu,
  Circle,
];

function getDomainIcon(name, index) {
  if (!name) {
    return Circle;
  }

  const lowered = name.toLowerCase();
  if (lowered.includes("bank") || lowered.includes("finance") || lowered.includes("insurance")) {
    return Landmark;
  }
  if (lowered.includes("health") || lowered.includes("pharma")) {
    return Stethoscope;
  }
  if (lowered.includes("retail") || lowered.includes("fmcg")) {
    return ShoppingBag;
  }
  if (lowered.includes("manufact") || lowered.includes("energy")) {
    return Factory;
  }
  if (lowered.includes("logistics") || lowered.includes("telecom")) {
    return Truck;
  }
  if (lowered.includes("education") || lowered.includes("legal") || lowered.includes("hr")) {
    return GraduationCap;
  }
  if (lowered.includes("saas") || lowered.includes("software") || lowered.includes("ai")) {
    return Cpu;
  }

  return DOMAIN_ICONS[index % DOMAIN_ICONS.length];
}

function DomainGrid({ domains, onExplore, className = "", maxItems = 8, dense = false, scrollable = true }) {
  const visibleDomains = domains.slice(0, maxItems);

  return (
    <section className={`flex min-h-0 flex-col rounded-2xl border border-border bg-surface shadow-card ${dense ? "p-3" : "p-4 md:p-5"} ${className}`}>
      <div className={`${dense ? "mb-2" : "mb-3"} flex items-end justify-between`}>
        <div>
          <h3 className="font-display text-base font-semibold text-ink">Explore by Business Domain</h3>
          <p className={`${dense ? "mt-0.5" : "mt-1"} text-xs text-muted`}>Start discovery by domain and open matching use cases.</p>
        </div>
      </div>

      {visibleDomains.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">No business domains available yet.</p>
      ) : (
        <div className={`${scrollable ? "panel-scrollbar overflow-y-auto pr-1" : "overflow-hidden"} min-h-0 flex-1`}>
          <div className={dense ? "space-y-1.5" : "space-y-2"}>
            {visibleDomains.map((domain, index) => {
            const Icon = getDomainIcon(domain.name, index);
            return (
              <button
                key={domain.name}
                type="button"
                onClick={() => onExplore(domain.name)}
                className={`group flex w-full items-center justify-between rounded-xl border border-border bg-surface-elevated text-left transition-all duration-200 hover:border-border-strong motion-reduce:transition-none ${dense ? "px-2.5 py-1.5" : "px-3 py-2"}`}
              >
                <div className={`flex min-w-0 items-center ${dense ? "gap-2" : "gap-2.5"}`}>
                  <div className={`inline-flex rounded-lg border border-border bg-surface text-primary ${dense ? "px-1.5 py-1" : "px-1.5 py-1.5"}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                  <p className={`truncate font-semibold text-ink ${dense ? "text-xs" : "text-sm"}`}>{domain.name}</p>
                </div>

                <div className={`flex items-center ${dense ? "gap-1.5" : "gap-2"}`}>
                  <span className={`rounded-full border border-border bg-surface font-semibold text-muted ${dense ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs"}`}>
                    {domain.count}
                  </span>
                  <ArrowUpRight className={`flex-shrink-0 text-muted transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none ${dense ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
                </div>
              </button>
            );
            })}
          </div>

          {domains.length > visibleDomains.length && (
            <p className="mt-2 text-xs text-muted">Showing {visibleDomains.length} domains to explore.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default memo(DomainGrid);
