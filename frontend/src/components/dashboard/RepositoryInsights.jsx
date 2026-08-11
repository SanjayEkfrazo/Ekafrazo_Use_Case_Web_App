import { memo } from "react";

const CHART_COLORS = [
  "rgb(var(--color-primary))",
  "rgb(var(--color-success))",
  "rgb(var(--color-warning))",
  "rgb(var(--color-danger))",
  "rgb(var(--color-gradient-via))",
  "rgb(var(--color-gradient-to))",
];

function createDonutGradient(items) {
  if (!items.length) {
    return "conic-gradient(rgb(var(--color-border)) 0 100%)";
  }

  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  let running = 0;
  const parts = items.map((item, index) => {
    const start = (running / total) * 100;
    running += item.count;
    const end = (running / total) * 100;
    return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${end}%`;
  });

  return `conic-gradient(${parts.join(", ")})`;
}

function RepositoryInsights({ domainSeries, technologySeries, className = "" }) {
  if (!domainSeries.length && !technologySeries.length) {
    return null;
  }

  const donutStyle = {
    backgroundImage: createDonutGradient(domainSeries.slice(0, 6)),
  };

  const maxTechCount = technologySeries.reduce((max, item) => Math.max(max, item.count), 0) || 1;

  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-ink">Repository Insights</h3>
        <p className="mt-1 text-xs text-muted">Compare domain coverage and technology usage.</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="min-h-0 overflow-hidden rounded-xl border border-border bg-surface-elevated p-3.5">
          <h4 className="text-sm font-semibold text-ink">Use Cases by Domain</h4>
          {domainSeries.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No domain data available yet.</p>
          ) : (
            <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 flex-shrink-0" aria-hidden>
                <div className="h-full w-full rounded-full" style={donutStyle} />
                <div className="absolute inset-[22%] rounded-full border border-border bg-surface" />
              </div>

              <ul className="space-y-1.5 text-xs">
                {domainSeries.slice(0, 6).map((item, index) => (
                  <li key={item.name} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      {item.name}
                    </span>
                    <span className="font-semibold tabular-nums text-ink">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className="min-h-0 overflow-hidden rounded-xl border border-border bg-surface-elevated p-3.5">
          <h4 className="text-sm font-semibold text-ink">Technologies Used</h4>
          {technologySeries.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No technology data available yet.</p>
          ) : (
            <div className="mt-3.5 space-y-2.5">
              {technologySeries.slice(0, 6).map((item, index) => {
                const width = `${Math.max((item.count / maxTechCount) * 100, 8)}%`;
                return (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted">{item.name}</span>
                      <span className="font-semibold tabular-nums text-ink">{item.count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-border/55">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default memo(RepositoryInsights);
