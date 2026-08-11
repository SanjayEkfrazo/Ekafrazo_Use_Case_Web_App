import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  Circle,
  Factory,
  Globe2,
  GraduationCap,
  Landmark,
  LayoutGrid,
  Moon,
  Presentation,
  Rocket,
  ShoppingBag,
  Stethoscope,
  Sun,
  Truck,
} from "lucide-react";
import Button from "../components/Button";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import PageHeaderCard from "../components/dashboard/PageHeaderCard";
import FormInput from "../components/FormInput";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import { useState } from "react";

const DOMAIN_ICONS = [
  Landmark,
  Stethoscope,
  ShoppingBag,
  Factory,
  Truck,
  GraduationCap,
  Globe2,
  Circle,
];

function getDomainIcon(name, index) {
  if (!name) {
    return Circle;
  }

  const lowered = name.toLowerCase();
  if (lowered.includes("bank") || lowered.includes("finance") || lowered.includes("insurance")) {
    return Landmark;
  }
  if (lowered.includes("health") || lowered.includes("pharma")) {
    return Stethoscope;
  }
  if (lowered.includes("retail") || lowered.includes("fmcg")) {
    return ShoppingBag;
  }
  if (lowered.includes("manufact") || lowered.includes("energy")) {
    return Factory;
  }
  if (lowered.includes("logistics") || lowered.includes("telecom")) {
    return Truck;
  }
  if (lowered.includes("education") || lowered.includes("legal") || lowered.includes("hr")) {
    return GraduationCap;
  }

  return DOMAIN_ICONS[index % DOMAIN_ICONS.length];
}

function CoverageMeta({ count, total }) {
  return (
    <span className="rounded-full border border-border bg-surface/70 px-2 py-0.5 text-[11px] font-medium text-muted">
      {count}/{total}
    </span>
  );
}

function DashboardOverview() {
  const navigate = useNavigate();
  const { dashboardData } = useOutletContext();
  const { isAdmin, unlockAdmin, lockAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const overviewModel = useMemo(() => {
    const totalUseCases = Number(dashboardData.totalUseCases || 0);
    const withDeployment = Number(dashboardData.withDeploymentUrlCount || 0);
    const withPresentation = Number(dashboardData.withResourceUrlCount || 0);
    const clientCount = Number(dashboardData.clientCount || 0);
    const domainCount = Number(dashboardData.uniqueDomainCount || 0);

    const safePercent = (value) => {
      if (!totalUseCases) {
        return 0;
      }
      return Math.round((value / totalUseCases) * 100);
    };

    const deploymentCoverage = safePercent(withDeployment);
    const presentationCoverage = safePercent(withPresentation);

    const kpiCards = [
      {
        label: "Total Use Cases",
        value: totalUseCases,
        meta: "All repository records",
        icon: LayoutGrid,
      },
      {
        label: "Business Domains",
        value: domainCount,
        meta: "Distinct domain groups",
        icon: Globe2,
      },
      {
        label: "Clients Covered",
        value: clientCount,
        meta: "Unique organizations",
        icon: Building2,
      },
      {
        label: "Live Demo Coverage",
        value: `${deploymentCoverage}%`,
        metaNode: <CoverageMeta count={withDeployment} total={totalUseCases} />,
        icon: Rocket,
      },
      {
        label: "Presentation Coverage",
        value: `${presentationCoverage}%`,
        metaNode: <CoverageMeta count={withPresentation} total={totalUseCases} />,
        icon: Presentation,
      },
    ];

    return {
      totalUseCases,
      kpiCards,
      domains: dashboardData.domainDistribution || [],
    };
  }, [dashboardData, navigate]);

  const handleUnlock = async () => {
    if (!passcode.trim()) {
      showToast("Passcode is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await unlockAdmin(passcode.trim());
      showToast("Admin mode enabled");
      setPasscode("");
      setIsUnlockOpen(false);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async () => {
    try {
      await lockAdmin();
      showToast("Admin mode disabled");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  if (dashboardData.isLoading) {
    return <DashboardSkeleton />;
  }

  if (dashboardData.totalUseCases === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-center shadow-card">
          <h3 className="font-display text-xl font-semibold text-ink">Your repository is ready</h3>
          <p className="mt-2 text-sm text-muted">Add your first use case to start browsing, insights, and quality checks.</p>
          {isAdmin ? (
            <Button onClick={() => navigate("/use-cases/new")} className="mt-5">
              Create Use Case
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate("/use-cases")} className="mt-5">
              Browse Use Cases
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3.5">
        <PageHeaderCard
          title="Dashboard Overview"
          subtitle="Repository pulse in one snapshot across volume, coverage, and domain distribution."
          actions={(
            <>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-elevated text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:text-ink"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {isAdmin ? (
                <Button variant="dangerSoft" onClick={handleLock} className="h-9 px-3 text-xs">
                  Admin Mode On
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setIsUnlockOpen(true)} className="h-9 border border-border px-3 text-xs">
                  Enable Admin Mode
                </Button>
              )}
            </>
          )}
        />

        <section className="rounded-2xl border border-border bg-surface px-3.5 py-4 shadow-card md:px-[18px] md:py-[18px]">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-ink md:text-base">Repository Summary</h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {overviewModel.kpiCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.label}
                  className="group relative flex h-[110px] w-full flex-col overflow-hidden rounded-[14px] border border-border bg-surface-elevated px-3 py-2.5 text-left transition-all duration-200 hover:border-border-strong"
                >
                  <span className="absolute right-2.5 top-2.5 inline-flex rounded-[10px] border border-border bg-surface p-1.5 text-primary transition-colors duration-200 group-hover:border-primary/35">
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>

                  <div className="flex min-h-0 flex-1 flex-col justify-end pr-8">
                    <p className="font-display text-[1.55rem] font-semibold leading-none tabular-nums text-ink">{card.value}</p>
                    <p className="mt-1 truncate text-[11px] font-semibold tracking-[0.01em] text-ink">{card.label}</p>
                    <div className="mt-1.5 flex h-[18px] items-center">
                      {card.metaNode ? card.metaNode : <p className="truncate text-[11px] text-muted">{card.meta}</p>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-3 shadow-card md:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-semibold text-ink md:text-base">Business Domain Explorer</h3>
              <p className="text-xs text-muted">Browse use cases by domain. Structure is ready for search enhancement.</p>
            </div>
            <span className="rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-muted">
              {overviewModel.domains.length} domains
            </span>
          </div>

          {overviewModel.domains.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">No business domains available yet.</p>
          ) : (
            <div className="panel-scrollbar h-[360px] overflow-y-auto pr-1 md:h-[420px]">
              <div className="space-y-1.5">
                {overviewModel.domains.map((domain, index) => {
                  const Icon = getDomainIcon(domain.name, index);

                  return (
                    <button
                      key={domain.name}
                      type="button"
                      onClick={() => navigate(`/use-cases?domain=${encodeURIComponent(domain.name)}`)}
                      className="group flex w-full items-center justify-between rounded-xl border border-border bg-surface-elevated px-2.5 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="inline-flex rounded-lg border border-border bg-surface p-1.5 text-primary">
                          <Icon className="h-4 w-4" strokeWidth={1.9} />
                        </span>
                        <p className="truncate text-sm font-medium text-ink">{domain.name}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-semibold text-muted">
                          {domain.count}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted transition-colors duration-200 group-hover:text-primary" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
    </div>

      <Modal
        isOpen={isUnlockOpen}
        onClose={() => {
          if (isSubmitting) {
            return;
          }
          setIsUnlockOpen(false);
          setPasscode("");
        }}
      >
        <h2 className="font-display text-lg font-semibold text-ink">Enable Admin Mode</h2>
        <p className="mt-2 text-sm text-muted">Enter the admin passcode to enable create, edit, and delete actions.</p>

        <div className="mt-4">
          <FormInput
            label="Admin Passcode"
            name="admin_passcode"
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Enter passcode"
            className="input-terminal"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setIsUnlockOpen(false);
              setPasscode("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleUnlock} disabled={isSubmitting}>
            {isSubmitting ? "Enabling..." : "Enable Admin Mode"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default DashboardOverview;
