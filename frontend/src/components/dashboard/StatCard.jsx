import { memo } from "react";

function StatCard({ icon: Icon, label, value, helperText, compact = false, tight = false, hideHelper = false }) {
  const compactPadding = tight ? "p-2" : "p-3";
  const compactIconPadding = tight ? "p-1.5" : "p-2";
  const compactValueClass = tight ? "mt-2 text-xl" : "mt-3 text-2xl";
  const compactLabelClass = tight ? "mt-1 text-[11px]" : "mt-1.5 text-xs";

  return (
    <article className={`group rounded-2xl border border-border bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-glow-primary motion-reduce:transform-none motion-reduce:transition-none ${compact ? compactPadding : "p-5 2xl:p-6"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-xl border border-border bg-surface-elevated text-primary transition-colors duration-200 group-hover:border-primary/35 motion-reduce:transition-none ${compact ? compactIconPadding : "p-2.5"}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        {!compact && <span className="rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-muted">KPI</span>}
      </div>

      <p className={`font-display font-semibold leading-none tabular-nums text-ink ${compact ? compactValueClass : "mt-5 text-3xl md:text-[2rem] 2xl:text-4xl"}`}>{value}</p>
      <p className={`font-semibold text-ink ${compact ? compactLabelClass : "mt-2 text-sm"}`}>{label}</p>
      {!hideHelper && <p className="mt-1 text-xs text-muted">{helperText}</p>}
    </article>
  );
}

export default memo(StatCard);
