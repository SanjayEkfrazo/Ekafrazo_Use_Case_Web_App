// Dashboard page: premium repository overview with actionable insights
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Cpu, Globe2, LayoutGrid, Presentation, Rocket } from "lucide-react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import DashboardHero from "../components/dashboard/DashboardHero";
import StatCard from "../components/dashboard/StatCard";
import DomainGrid from "../components/dashboard/DomainGrid";
import RecentUseCases from "../components/dashboard/RecentUseCases";
import TechnologyCloud from "../components/dashboard/TechnologyCloud";
import RepositoryHealth from "../components/dashboard/RepositoryHealth";
import RepositoryInsights from "../components/dashboard/RepositoryInsights";
import { fetchDashboardSummary, fetchUseCases } from "../services/useCaseService";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

function normalizeText(value) {
  return String(value || "").trim();
}

function parseTechnologyStack(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/[,;|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

async function fetchAllUseCasesForDashboard() {
  const pageSize = 100;
  let currentPage = 1;
  let totalPages = 1;
  const collected = [];

  do {
    const response = await fetchUseCases({
      page: currentPage,
      limit: pageSize,
      search: "",
      domain: "",
      sortBy: "updated_at",
      sortOrder: "desc",
    });

    collected.push(...(response?.data || []));
    totalPages = response?.pagination?.totalPages || 1;
    currentPage += 1;
  } while (currentPage <= totalPages);

  return collected;
}

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

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [allUseCases, setAllUseCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let isCancelled = false;

    async function loadSummary() {
      try {
        const [summaryResponse, allUseCasesData] = await Promise.all([
          fetchDashboardSummary(),
          fetchAllUseCasesForDashboard(),
        ]);

        if (isCancelled) {
          return;
        }

        setSummary(summaryResponse.data || {});
        setAllUseCases(allUseCasesData);
      } catch (error) {
        if (!isCancelled) {
          showToast(error.message || "Failed to load dashboard data", "error");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isCancelled = true;
    };
  }, [showToast]);

  const viewModel = useMemo(() => {
    const items = allUseCases;

    const domainMap = new Map();
    const clientSet = new Set();
    const technologyMap = new Map();

    let missingDeploymentCount = 0;
    let missingPresentationCount = 0;
    let missingImageCount = 0;
    let incompleteRecordsCount = 0;

    items.forEach((item) => {
      const domain = normalizeText(item.domain);
      const client = normalizeText(item.client_name);
      const deploymentUrl = normalizeText(item.deployment_url);
      const resourceUrl = normalizeText(item.resource_url);
      const imageUrl = normalizeText(item.domain_image_url);

      if (domain) {
        domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
      }
      if (client) {
        clientSet.add(client.toLowerCase());
      }

      parseTechnologyStack(item.technology_stack).forEach((techName) => {
        technologyMap.set(techName, (technologyMap.get(techName) || 0) + 1);
      });

      if (!deploymentUrl) {
        missingDeploymentCount += 1;
      }
      if (!resourceUrl) {
        missingPresentationCount += 1;
      }
      if (!imageUrl) {
        missingImageCount += 1;
      }

      const hasCoreGaps = [
        "title",
        "description",
        "domain",
        "client_name",
        "technology_stack",
      ].some((field) => !normalizeText(item[field]));
      if (hasCoreGaps || !deploymentUrl || !resourceUrl || !imageUrl) {
        incompleteRecordsCount += 1;
      }
    });

    const domainDistribution = Array.from(domainMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const technologyDistribution = Array.from(technologyMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const kpis = [
      {
        label: "Total Use Cases",
        value: summary?.total ?? items.length,
        helperText: "Across all domains",
        icon: LayoutGrid,
      },
      {
        label: "Business Domains",
        value: summary?.uniqueDomainCount ?? domainDistribution.length,
        helperText: "Available categories",
        icon: Globe2,
      },
      {
        label: "Clients",
        value: clientSet.size,
        helperText: "Organizations covered",
        icon: Building2,
      },
      {
        label: "Live Deployments",
        value: summary?.withDeploymentUrlCount ?? items.length - missingDeploymentCount,
        helperText: "Working demo URLs",
        icon: Rocket,
      },
      {
        label: "Presentations",
        value: summary?.withResourceUrlCount ?? items.length - missingPresentationCount,
        helperText: "Available resources",
        icon: Presentation,
      },
      {
        label: "Technology Stacks",
        value: technologyDistribution.length,
        helperText: "Technologies used",
        icon: Cpu,
      },
    ];

    const healthCards = [
      { kind: "deployment", label: "Missing Deployment URLs", count: missingDeploymentCount },
      { kind: "presentation", label: "Missing Presentation URLs", count: missingPresentationCount },
      { kind: "image", label: "Missing Images", count: missingImageCount },
      { kind: "incomplete", label: "Incomplete Records", count: incompleteRecordsCount },
    ];

    const needsAttention = summary?.needsAttention?.length
      ? summary.needsAttention
      : items
          .filter((item) => !normalizeText(item.deployment_url) || !normalizeText(item.resource_url))
          .slice(0, 5);

    return {
      kpis,
      domainDistribution,
      technologyDistribution,
      healthCards,
      recentlyUpdated: summary?.recentlyUpdated || items.slice(0, 6),
      needsAttention,
      totalUseCases: summary?.total ?? items.length,
    };
  }, [allUseCases, summary]);

  return (
    <div className="page-enter flex h-full min-h-full flex-col overflow-hidden bg-app">
      <Navbar title="Dashboard" subtitle="Premium visibility into your enterprise use case repository" compact />

      <div className="panel-scrollbar min-h-0 flex-1 overflow-y-auto p-3.5 md:p-5">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-4 md:gap-5">
            <DashboardHero
              isAdmin={isAdmin}
              onSearch={() => navigate("/use-cases")}
              onBrowse={() => navigate("/use-cases")}
              onCreate={() => navigate("/use-cases/new")}
            />

            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card md:p-6">
              <div className="mb-4">
                <h3 className="font-display text-xl font-semibold text-ink">Repository Overview</h3>
                <p className="mt-1 text-sm text-muted">High-level metrics across business, deployment, and technology coverage.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {viewModel.kpis.map((kpi) => (
                  <StatCard key={kpi.label} label={kpi.label} value={kpi.value} helperText={kpi.helperText} icon={kpi.icon} />
                ))}
              </div>
            </section>

            <DomainGrid
              domains={viewModel.domainDistribution}
              onExplore={(domainName) => navigate(`/use-cases?domain=${encodeURIComponent(domainName)}`)}
            />

            <RecentUseCases
              items={viewModel.recentlyUpdated}
              onOpenDetails={(id) => navigate(`/use-cases/${id}`)}
              formatDate={formatRelativeDate}
            />

            <TechnologyCloud technologies={viewModel.technologyDistribution} />

            {isAdmin && (
              <RepositoryHealth
                cards={viewModel.healthCards}
                needsAttention={viewModel.needsAttention}
                onOpenDetails={(id) => navigate(`/use-cases/${id}`)}
              />
            )}

            <RepositoryInsights
              domainSeries={viewModel.domainDistribution}
              technologySeries={viewModel.technologyDistribution}
            />

            {viewModel.totalUseCases === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center shadow-card">
                <h3 className="font-display text-xl font-semibold text-ink">Repository is ready for first entries</h3>
                <p className="mt-2 text-sm text-muted">Create your first use case to activate charts, domain insights, and health checks.</p>
                {isAdmin ? (
                  <Button onClick={() => navigate("/use-cases/new")} className="mt-5">
                    Create First Use Case
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => navigate("/use-cases")} className="mt-5">
                    Browse Use Cases
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
