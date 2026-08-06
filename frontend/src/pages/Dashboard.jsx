// Dashboard page: shows total count, recently updated use cases, and quick navigation
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import Button from "../components/Button";
import { fetchDashboardSummary } from "../services/useCaseService";
import { useAuth } from "../hooks/useAuth";

function formatRelativeDate(value) {
  if (!value) {
    return "Time not available";
  }

  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return "Time not available";
  }

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatCard({ label, value, detail, tone = "neutral" }) {
  const toneStyles = {
    neutral: "border-border bg-surface",
    primary: "border-primary/25 bg-primary-light/60",
    warning: "border-warning/30 bg-warning-light",
    success: "border-success/35 bg-success-light",
    danger: "border-danger/30 bg-danger-light",
  };

  return (
    <div className={`rounded-lg border p-3 shadow-card ${toneStyles[tone] || toneStyles.neutral}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold leading-none text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Fetch dashboard summary data when the page loads
  useEffect(() => {
    async function loadSummary() {
      try {
        const response = await fetchDashboardSummary();
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to load dashboard summary", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSummary();
  }, []);

  return (
    <div className="flex h-full min-h-full flex-col overflow-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#f5f5f5_32%,#f5f5f5_100%)]">
      <Navbar title="Dashboard" subtitle="A quick summary of your work" compact />

      <div className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">
        {isLoading ? (
          <Loader rows={6} />
        ) : (
          <div className="flex h-full min-h-0 flex-col gap-3.5">
            <div className="rounded-xl border border-border/80 bg-surface/80 p-3 shadow-card backdrop-blur sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Overview</p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-ink">What Is Happening Now</h2>
                  <p className="mt-1 text-xs text-muted">Totals, blocked items, and urgent work in one place.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => navigate("/use-cases")} className="px-3 py-1.5 text-xs">
                    View All Use Cases
                  </Button>
                  {isAdmin && (
                    <Button onClick={() => navigate("/use-cases/new")} className="px-3 py-1.5 text-xs">
                      Create Use Case
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Use Cases"
                  value={summary?.total ?? 0}
                  detail={`${summary?.updatedLast7Days ?? 0} changed in the last 7 days`}
                  tone="primary"
                />
                <StatCard
                  label="In Progress"
                  value={summary?.inProgressCount ?? 0}
                  detail="Work that is currently ongoing"
                  tone="warning"
                />
                <StatCard
                  label="Completed"
                  value={summary?.completedCount ?? 0}
                  detail="Work that is finished"
                  tone="success"
                />
                <StatCard
                  label="Needs Attention"
                  value={summary?.blockedCount ?? 0}
                  detail={`${summary?.highPriorityOpenCount ?? 0} urgent items are still open`}
                  tone="danger"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-5">
              <div className="min-h-0 md:col-span-1 xl:col-span-3">
                <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-surface shadow-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-ink">Recently Updated</h3>
                      <p className="text-xs text-muted">Latest items that were changed</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium text-muted">Scroll to see more</span>
                      <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => navigate("/use-cases")}>
                        Open list
                      </Button>
                    </div>
                  </div>

                  {summary?.recentlyUpdated?.length ? (
                    <div className="panel-scrollbar min-h-0 flex-1 overflow-y-auto">
                      {summary.recentlyUpdated.map((useCase) => (
                        <button
                          key={useCase.id}
                          type="button"
                          onClick={() => navigate(`/use-cases/${useCase.id}`)}
                          className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left transition-colors hover:bg-primary-light/35 last:border-b-0"
                        >
                          <div className="pr-4">
                            <p className="text-sm font-semibold text-ink">{useCase.title}</p>
                            <p className="mt-1 text-xs text-muted">{useCase.domain} • {useCase.client_name}</p>
                            <p className="mt-1 text-xs text-muted">Changed {formatRelativeDate(useCase.updated_at)}</p>
                          </div>

                          <div className="flex flex-shrink-0 flex-col items-end gap-2">
                            <StatusBadge status={useCase.status} />
                            <PriorityBadge priority={useCase.priority} />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-5 py-8 text-sm text-muted">No items yet. Add your first one to start seeing updates here.</p>
                  )}
                </div>
              </div>

              <div className="min-h-0 md:col-span-1 xl:col-span-2">
                <div className="flex h-full min-h-0 flex-col gap-3.5">
                  <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-surface shadow-card">
                    <div className="border-b border-border px-4 py-3">
                      <h3 className="font-display text-base font-semibold text-ink">Important Items</h3>
                      <p className="text-xs text-muted">Blocked items or urgent work that is not done yet</p>
                    </div>

                    <div className="panel-scrollbar min-h-0 flex-1 divide-y divide-border overflow-y-auto">
                      {summary?.needsAttention?.length ? (
                        summary.needsAttention.map((useCase) => (
                          <div key={useCase.id} className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 pr-2">
                                <p className="text-sm font-semibold text-ink">{useCase.title}</p>
                                <p className="mt-1 text-xs text-muted">{useCase.domain} • {useCase.client_name}</p>
                              </div>
                              <Button
                                variant="primary"
                                className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold"
                                onClick={() => navigate(`/use-cases/${useCase.id}`)}
                              >
                                View details
                              </Button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <StatusBadge status={useCase.status} />
                              <PriorityBadge priority={useCase.priority} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="px-5 py-8 text-sm text-muted">No blocked or urgent open items right now.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 rounded-xl border border-border bg-surface p-4 shadow-card">
                    <h3 className="font-display text-base font-semibold text-ink">Status Summary</h3>
                    <p className="mt-1 text-xs text-muted">How your items are spread across each stage</p>
                    <div className="mt-3 space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Draft + Review + Approved</span>
                        <span className="font-semibold text-ink">
                          {(summary?.byStatus?.Draft || 0) + (summary?.byStatus?.["In Review"] || 0) + (summary?.byStatus?.Approved || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">In Progress</span>
                        <span className="font-semibold text-ink">{summary?.inProgressCount ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">On Hold</span>
                        <span className="font-semibold text-ink">{summary?.blockedCount ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Completed</span>
                        <span className="font-semibold text-ink">{summary?.completedCount ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!summary?.total && (
              <div className="rounded-xl border border-dashed border-border bg-surface/70 px-5 py-5 text-center shadow-card">
                <h3 className="font-display text-lg font-semibold text-ink">No items yet</h3>
                <p className="mt-2 text-sm text-muted">Create your first item to start seeing data on this dashboard.</p>
                {isAdmin ? (
                  <Button onClick={() => navigate("/use-cases/new")} className="mt-4">
                    Create first item
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => navigate("/use-cases")} className="mt-4">
                    Browse items
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
