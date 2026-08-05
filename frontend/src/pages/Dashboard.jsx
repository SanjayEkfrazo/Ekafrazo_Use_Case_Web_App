// Dashboard page: shows total count, recently updated use cases, and quick navigation
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { fetchDashboardSummary } from "../services/useCaseService";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
    <div>
      <Navbar title="Dashboard" subtitle="A quick overview of your use cases" />

      <div className="p-6 md:p-8">
        {isLoading ? (
          <Loader rows={3} />
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
                <p className="text-sm text-muted">Total Use Cases</p>
                <p className="mt-2 font-display text-3xl font-semibold text-ink">{summary?.total ?? 0}</p>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5 shadow-card">
                <p className="text-sm text-muted">Quick Navigation</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button onClick={() => navigate("/use-cases")}>View All Use Cases</Button>
                  <Button variant="secondary" onClick={() => navigate("/use-cases/new")}>
                    Create Use Case
                  </Button>
                </div>
              </div>
            </div>

            {/* Recently updated list */}
            <div className="mt-8">
              <h2 className="font-display text-base font-semibold text-ink">Recently Updated</h2>
              <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
                {summary?.recentlyUpdated?.length ? (
                  summary.recentlyUpdated.map((useCase) => (
                    <button
                      key={useCase.id}
                      onClick={() => navigate(`/use-cases/${useCase.id}/edit`)}
                      className="flex w-full items-center justify-between border-b border-border px-5 py-4 text-left last:border-0 hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{useCase.title}</p>
                        <p className="text-xs text-muted">{useCase.domain} · {useCase.client_name}</p>
                      </div>
                      <StatusBadge status={useCase.status} />
                    </button>
                  ))
                ) : (
                  <p className="px-5 py-6 text-sm text-muted">No use cases yet. Create your first one to get started.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
