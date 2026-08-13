import { Search, ArrowRight, Plus } from "lucide-react";
import Button from "../Button";

function DashboardHero({ isAdmin, onSearch, onBrowse, onCreate, compact = false, className = "" }) {
  return (
    <section className={`rounded-2xl border border-border bg-hero-glow shadow-card ${compact ? "flex min-h-0 flex-col justify-between px-4 py-3.5 md:px-5 md:py-4" : "px-6 py-6 md:px-7 md:py-7"} ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-border bg-surface/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Enterprise Use Case Repository
          </p>
          <h2 className={`mt-1.5 font-display font-semibold leading-tight text-ink ${compact ? "text-2xl md:text-[1.8rem]" : "text-3xl md:text-4xl"}`}>
            Discover Enterprise Use Cases
          </h2>
          <p className={`max-w-2xl text-muted ${compact ? "mt-1.5 text-xs" : "mt-2.5 text-sm"}`}>
            Browse by business domain, open live demos, and review implementation ideas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" className={compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-2"} onClick={onSearch}>
            <Search className="h-4 w-4" />
            Search Use Cases
          </Button>
          <Button className={compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-2"} onClick={onBrowse}>
            Browse Use Cases
            <ArrowRight className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button variant="secondary" className={compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-2"} onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Create Use Case
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted sm:grid-cols-3">
        <p className="rounded-lg border border-border bg-surface/85 px-2.5 py-1.5">Browse by business domain and client</p>
        <p className="rounded-lg border border-border bg-surface/85 px-2.5 py-1.5">Open demos and presentations quickly</p>
        <p className="rounded-lg border border-border bg-surface/85 px-2.5 py-1.5">Track records that need review</p>
      </div>
    </section>
  );
}

export default DashboardHero;
