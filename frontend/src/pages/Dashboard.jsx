// Dashboard page: shows total count, recently updated use cases, and quick navigation
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Globe, LayoutGrid, Rocket } from "lucide-react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
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

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5 text-center transition-all duration-200 hover:border-border-strong hover:shadow-card-hover motion-reduce:transition-none motion-reduce:transform-none">
      <Icon className="mx-auto mb-3 h-6 w-6 text-primary" strokeWidth={1.75} />
      <p className="font-display text-3xl font-bold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
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
    <div className="page-enter flex h-full min-h-full flex-col overflow-hidden bg-app">
      <Navbar title="Dashboard" subtitle="A quick summary of your work" compact />

      <div className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">
        {isLoading ? (
          <Loader rows={6} />
        ) : (
          <div className="flex h-full min-h-0 flex-col gap-3.5">
            <div className="rounded-2xl border border-border bg-app bg-hero-glow px-8 py-10 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="font-display text-4xl font-bold text-ink">Overview</h2>
                  <p className="mt-2 text-sm text-muted">A snapshot of every use case in the system.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => navigate("/use-cases")} className="px-3 py-2 text-xs">
                    View All Use Cases
                  </Button>
                  {isAdmin && (
                    <Button onClick={() => navigate("/use-cases/new")} className="px-3 py-2 text-xs">
                      Create Use Case
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Use Cases"
                  value={summary?.total ?? 0}
                  icon={LayoutGrid}
                />
                <StatCard
                  label="Domains Covered"
                  value={summary?.uniqueDomainCount ?? 0}
                  icon={Globe}
                />
                <StatCard
                  label="With Deployment URL"
                  value={summary?.withDeploymentUrlCount ?? 0}
                  icon={Rocket}
                />
                <StatCard
                  label="With File URL"
                  value={summary?.withResourceUrlCount ?? 0}
                  icon={FileText}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-5">
              <div className="min-h-0 md:col-span-1 xl:col-span-3">
                <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-surface shadow-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink">Recently Updated</h3>
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
                          className="flex w-full cursor-pointer items-center justify-between border-b border-border px-4 py-3 text-left transition-colors duration-200 hover:bg-surface-elevated motion-reduce:transition-none last:border-b-0"
                        >
                          <div className="pr-4">
                            <p className="text-sm font-semibold text-ink">{useCase.title}</p>
                            <p className="mt-1 text-xs text-muted">{useCase.domain} • {useCase.client_name}</p>
                            <p className="mt-1 font-mono text-xs text-muted">Changed {formatRelativeDate(useCase.updated_at)}</p>
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
                      <h3 className="font-display text-lg font-semibold text-ink">Important Items</h3>
                      <p className="text-xs text-muted">Items that are missing deployment or file links</p>
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
                          </div>
                        ))
                      ) : (
                        <p className="px-5 py-8 text-sm text-muted">All visible items already include both links.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!summary?.total && (
              <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-5 text-center shadow-card">
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
