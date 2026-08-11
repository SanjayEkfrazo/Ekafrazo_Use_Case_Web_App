import { useNavigate, useOutletContext } from "react-router-dom";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import PageHeaderCard from "../components/dashboard/PageHeaderCard";
import RecentUseCases from "../components/dashboard/RecentUseCases";
import { formatRelativeDate } from "../utils/dashboard";

function DashboardActivity() {
  const navigate = useNavigate();
  const { dashboardData } = useOutletContext();

  if (dashboardData.isLoading) {
    return <DashboardSkeleton />;
  }

  const recentlyAdded = (dashboardData.recentlyCreated || []).slice(0, 5);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <PageHeaderCard
        title="Dashboard Activity"
        subtitle="Track recently updated and newly added use cases across the repository."
      />

      <div className="grid min-h-0 grid-cols-1 gap-2.5 lg:grid-cols-2">
        <RecentUseCases
          className="h-full"
          items={dashboardData.recentlyUpdated}
          maxItems={6}
          onOpenDetails={(id) => navigate(`/use-cases/${id}`)}
          formatDate={formatRelativeDate}
        />

        <section className="flex min-h-0 flex-col rounded-2xl border border-border bg-surface p-4 shadow-card">
          <h3 className="mb-2.5 font-display text-base font-semibold text-ink">Recently Added</h3>

          {recentlyAdded.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted">No recently added use cases yet.</p>
          ) : (
            <div className="panel-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {recentlyAdded.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/use-cases/${item.id}`)}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-left transition-all duration-200 hover:border-border-strong motion-reduce:transition-none"
                >
                  <p className="line-clamp-1 text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.domain || "Unknown domain"} • {item.client_name || "Unknown client"}</p>
                  <p className="mt-0.5 text-[11px] text-muted">Added {formatRelativeDate(item.created_at || item.updated_at)}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DashboardActivity;
