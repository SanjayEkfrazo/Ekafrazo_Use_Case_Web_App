import { useNavigate, useOutletContext } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import RepositoryHealth from "../components/dashboard/RepositoryHealth";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import PageHeaderCard from "../components/dashboard/PageHeaderCard";
import { useAuth } from "../hooks/useAuth";

function DashboardQuality() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { dashboardData } = useOutletContext();

  const handleReviewByKind = (kind) => {
    navigate(`/use-cases?review=${encodeURIComponent(kind)}`);
  };

  if (dashboardData.isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
        <PageHeaderCard
          title="Dashboard Quality"
          subtitle="Monitor data quality, missing fields, and records that need follow-up."
        />

        <section className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-light text-warning-text">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-ink">Admin Access Required</h2>
          <p className="mt-2 text-sm text-muted">This page is available only in admin mode.</p>
        </section>
      </div>
    );
  }

  const healthCards = [
    { kind: "deployment", label: "Demo Link Missing", count: dashboardData.healthCounts.missingDeploymentCount },
    { kind: "presentation", label: "Presentation Link Missing", count: dashboardData.healthCounts.missingPresentationCount },
    { kind: "image", label: "Image Missing", count: dashboardData.healthCounts.missingImageCount },
    { kind: "incomplete", label: "Details Incomplete", count: dashboardData.healthCounts.incompleteRecordsCount },
  ];

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <PageHeaderCard
        title="Dashboard Quality"
        subtitle="Monitor data quality, missing fields, and records that need follow-up."
      />

      <div className="min-h-0">
        <RepositoryHealth
          className="h-full"
          cards={healthCards}
          needsAttention={dashboardData.needsAttention}
          onOpenDetails={(id) => navigate(`/use-cases/${id}`)}
          onOpenLibrary={() => navigate("/use-cases")}
          onReviewKind={handleReviewByKind}
        />
      </div>
    </div>
  );
}

export default DashboardQuality;
