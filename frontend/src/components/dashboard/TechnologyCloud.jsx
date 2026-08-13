import { memo } from "react";

function TechnologyCloud({ technologies, className = "", maxItems = 18 }) {
  const visibleTechnologies = technologies.slice(0, maxItems);

  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-ink">Technologies Used</h3>
        <p className="mt-1 text-xs text-muted">Most common technologies used across use cases.</p>
      </div>

      {visibleTechnologies.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">No technology data available yet.</p>
      ) : (
        <div className="panel-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-wrap gap-1.5">
            {visibleTechnologies.map((item) => (
              <div
                key={item.name}
                className="group rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-on-solid motion-reduce:transition-none"
              >
                <span className="font-semibold text-ink group-hover:text-on-solid">{item.name}</span>
                <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold text-primary-text group-hover:bg-white/20 group-hover:text-on-solid">{item.count}</span>
              </div>
            ))}
          </div>

          {technologies.length > visibleTechnologies.length && (
            <p className="mt-2 text-xs text-muted">Showing top {visibleTechnologies.length} technologies.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default memo(TechnologyCloud);
