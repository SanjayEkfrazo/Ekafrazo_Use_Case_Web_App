import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import PageHeaderCard from "../components/dashboard/PageHeaderCard";
import RepositoryInsights from "../components/dashboard/RepositoryInsights";

function DashboardInsights() {
  const { dashboardData } = useOutletContext();

  const analyticsSummary = useMemo(() => {
    const domains = dashboardData.domainDistribution || [];
    const technologies = dashboardData.technologyDistribution || [];
    const total = Number(dashboardData.totalUseCases || 0);

    const topDomain = domains[0] || null;
    const topTechnology = technologies[0] || null;

    const topDomainShare = total > 0 && topDomain ? Math.round((topDomain.count / total) * 100) : 0;
    const topTechnologyShare = total > 0 && topTechnology ? Math.round((topTechnology.count / total) * 100) : 0;

    return {
      domainCount: domains.length,
      technologyCount: technologies.length,
      topDomainName: topDomain?.name || "No domain data",
      topDomainShare,
      topTechnologyName: topTechnology?.name || "No technology data",
      topTechnologyShare,
    };
  }, [dashboardData]);

  if (dashboardData.isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <PageHeaderCard
        title="Dashboard Insights"
        subtitle="Analyze domain and technology trends to understand repository momentum."
      />

      <section className="rounded-2xl border border-border bg-surface p-3.5 shadow-card md:p-4">
        <h2 className="font-display text-base font-semibold text-ink">Trend Snapshot</h2>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted">Business Domains</p>
            <p className="mt-1 text-xl font-semibold leading-none text-ink">{analyticsSummary.domainCount}</p>
          </article>

          <article className="rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted">Technologies Used</p>
            <p className="mt-1 text-xl font-semibold leading-none text-ink">{analyticsSummary.technologyCount}</p>
          </article>

          <article className="rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted">Top Domain</p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-ink">{analyticsSummary.topDomainName}</p>
            <p className="text-xs text-muted">{analyticsSummary.topDomainShare}% of repository</p>
          </article>

          <article className="rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted">Top Technology</p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-ink">{analyticsSummary.topTechnologyName}</p>
            <p className="text-xs text-muted">Used in {analyticsSummary.topTechnologyShare}% of records</p>
          </article>
        </div>
      </section>

      <div className="min-h-0">
        <RepositoryInsights
          className="h-full"
          domainSeries={dashboardData.domainDistribution}
          technologySeries={dashboardData.technologyDistribution}
        />
      </div>
    </div>
  );
}

export default DashboardInsights;
