function SkeletonBlock({ className = "" }) {
  return <div className={`animate-shimmer rounded-2xl bg-gradient-to-r from-surface-elevated via-border to-surface-elevated bg-[length:200%_100%] ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3 md:gap-4">
      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card md:p-6">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="mt-3 h-10 w-full max-w-3xl" />
        <SkeletonBlock className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-4 flex flex-wrap gap-2">
          <SkeletonBlock className="h-9 w-24" />
          <SkeletonBlock className="h-9 w-36" />
          <SkeletonBlock className="h-9 w-44" />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5">
        <SkeletonBlock className="h-5 w-48" />
        <SkeletonBlock className="mt-2 h-4 w-72" />
        <div className="mt-4 grid grid-cols-2 gap-2.5 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-24" />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5">
        <SkeletonBlock className="h-5 w-44" />
        <div className="mt-4 grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="grid min-h-0 grid-cols-1 gap-2.5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={`domain-${index}`} className="h-20" />
            ))}
          </div>
          <div className="flex min-h-0 gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={`recent-${index}`} className="h-full min-h-[170px] min-w-[180px] flex-1" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardSkeleton;
