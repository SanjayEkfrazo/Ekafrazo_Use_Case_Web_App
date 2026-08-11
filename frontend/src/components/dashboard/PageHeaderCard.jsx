function PageHeaderCard({ title, subtitle, actions = null, className = "" }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface px-4 py-3 shadow-card md:px-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-semibold text-ink md:text-xl">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted md:text-sm">{subtitle}</p> : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export default PageHeaderCard;
