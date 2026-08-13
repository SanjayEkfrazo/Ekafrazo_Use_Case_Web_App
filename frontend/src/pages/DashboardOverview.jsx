import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Globe2,
  LayoutGrid,
  Moon,
  Presentation,
  RefreshCw,
  Rocket,
  Sun,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../components/Button";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import PageHeaderCard from "../components/dashboard/PageHeaderCard";
import FormInput from "../components/FormInput";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import useAutoMotionState from "../hooks/useAutoMotionState";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import { formatRelativeDate } from "../utils/dashboard";

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
  const reduceMotion = useReducedMotion();
  const { isIdle, tick } = useAutoMotionState({ enabled: !reduceMotion, idleMs: 3800, tickMs: 2400 });

  const commandCenterModel = useMemo(() => {
    const totalUseCases = Number(dashboardData.totalUseCases || 0);
    const withDeployment = Number(dashboardData.withDeploymentUrlCount || 0);
    const withPresentation = Number(dashboardData.withResourceUrlCount || 0);
    const clientCount = Number(dashboardData.clientCount || 0);
    const domainCount = Number(dashboardData.uniqueDomainCount || 0);
    const createdThisMonthCount = Number(dashboardData.createdThisMonthCount || 0);
    const healthCounts = dashboardData.healthCounts || {
      missingDeploymentCount: 0,
      missingPresentationCount: 0,
      missingImageCount: 0,
      incompleteRecordsCount: 0,
    };
    const qualityScore = totalUseCases > 0
      ? Math.round(((totalUseCases - healthCounts.incompleteRecordsCount) / totalUseCases) * 100)
      : 0;
    const readinessDistribution = dashboardData.readinessDistribution || [];
    const statusRows = readinessDistribution
      .map((status) => ({
        ...status,
        percent: totalUseCases > 0 ? Math.round((status.count / totalUseCases) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
    const domainDistribution = dashboardData.domainDistribution || [];
    const topDomains = domainDistribution.slice(0, 4);
    const remainingDomainCount = domainDistribution.slice(4).reduce((sum, item) => sum + item.count, 0);
    const domainRows = remainingDomainCount > 0
      ? [...topDomains, { name: "Others", count: remainingDomainCount, isOthers: true }]
      : topDomains;
    const topDomain = domainDistribution[0] || null;
    const recentlyUpdated = (dashboardData.recentlyUpdated || []).slice(0, 4);
    const lastUpdatedAt = dashboardData.lastUpdatedAt ? formatRelativeDate(dashboardData.lastUpdatedAt) : "Time not available";

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
        meta: `${createdThisMonthCount} added this month`,
        icon: LayoutGrid,
        accent: "cc-accent-blue",
      },
      {
        label: "Business Domains Covered",
        value: domainCount,
        meta: "Distinct domain groups",
        icon: Globe2,
        accent: "cc-accent-violet",
      },
      {
        label: "Clients Covered",
        value: clientCount,
        meta: "Unique organizations",
        icon: Building2,
        accent: "cc-accent-slate",
      },
      {
        label: "Live Demo Coverage",
        value: `${deploymentCoverage}%`,
        metaNode: <CoverageMeta count={withDeployment} total={totalUseCases} />,
        icon: Rocket,
        accent: "cc-accent-blue",
      },
      {
        label: "Presentation Coverage",
        value: `${presentationCoverage}%`,
        metaNode: <CoverageMeta count={withPresentation} total={totalUseCases} />,
        icon: Presentation,
        accent: "cc-accent-violet",
      },
    ];

    const governanceRows = [
      { label: "Missing Demo URLs", count: healthCounts.missingDeploymentCount },
      { label: "Missing Presentations", count: healthCounts.missingPresentationCount },
      { label: "Missing Images", count: healthCounts.missingImageCount },
    ];

    const nextActions = [];
    if (healthCounts.missingDeploymentCount > 0) {
      nextActions.push(`${healthCounts.missingDeploymentCount} records need demo URLs`);
    }
    if (healthCounts.missingPresentationCount > 0) {
      nextActions.push(`${healthCounts.missingPresentationCount} records need presentation links`);
    }
    if (healthCounts.incompleteRecordsCount > 0) {
      nextActions.push(`${healthCounts.incompleteRecordsCount} records need profile completion`);
    }

    return {
      totalUseCases,
      lastUpdatedAt,
      kpiCards,
      qualityScore,
      statusRows,
      domainRows,
      domainCount,
      recentlyUpdated,
      governanceRows,
      nextActions: nextActions.slice(0, 3),
      hasGovernanceGaps: nextActions.length > 0,
      updatedLast7Days: Number(dashboardData.updatedLast7Days || 0),
      topDomain,
      clientCount,
      deploymentCoverage,
      presentationCoverage,
      createdThisMonthCount,
    };
  }, [dashboardData]);

  const handleRefresh = () => {
    window.location.reload();
  };

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

  if (dashboardData.hasError && commandCenterModel.totalUseCases === 0) {
    return (
      <section className="flex h-full min-h-0 items-center justify-center">
        <article className="command-center-panel w-full max-w-2xl px-5 py-6 text-center">
          <h3 className="font-display text-xl font-semibold text-ink">Dashboard data is unavailable</h3>
          <p className="mt-2 text-sm text-muted">Try refreshing the dashboard. If this continues, open the repository page to verify API availability.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={handleRefresh}>Refresh</Button>
            <Button variant="secondary" onClick={() => navigate("/use-cases")}>Open Repository</Button>
          </div>
        </article>
      </section>
    );
  }

  if (dashboardData.totalUseCases === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <div className="command-center-panel w-full max-w-2xl border-dashed px-4 py-6 text-center">
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
      <div className="command-center-shell">
        <div className="command-center-atmosphere" aria-hidden />

        <div className="relative z-10 space-y-3 p-2.5 md:p-3">
          <PageHeaderCard
          className="command-center-panel"
          title="Use Case Command Center"
          subtitle="Repository overview • portfolio health • readiness • activity"
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

              <button
                type="button"
                onClick={handleRefresh}
                aria-label="Refresh command center"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-elevated text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:text-ink"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <span className="hidden rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-[11px] font-medium text-muted lg:inline-flex">
                Updated {commandCenterModel.lastUpdatedAt}
              </span>

              {isAdmin ? (
                <Button onClick={handleLock} className="h-9 px-3 text-xs">
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

          <section className="command-center-panel px-3 py-3 md:px-3.5 md:py-3.5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
              {commandCenterModel.kpiCards.map((card, index) => {
                const Icon = card.icon;
                const autoPulse = isIdle && tick % commandCenterModel.kpiCards.length === index;

                return (
                  <motion.article
                    key={card.label}
                    className={`command-center-kpi group relative flex h-[104px] w-full flex-col overflow-hidden rounded-[14px] px-3 py-2.5 text-left ${card.accent} ${autoPulse ? "command-center-kpi-auto" : ""}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
                    animate={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.34, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] } }}
                  >
                    <span className="absolute right-2.5 top-2.5 inline-flex rounded-[10px] border border-border/80 bg-surface/70 p-1.5 text-primary transition-colors duration-200 group-hover:border-primary/35">
                      <Icon className="h-4 w-4" strokeWidth={1.9} />
                    </span>

                    <div className="flex min-h-0 flex-1 flex-col justify-end pr-8">
                      <p className="font-display text-[1.55rem] font-semibold leading-none tabular-nums text-ink">{card.value}</p>
                      <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-ink">{card.label}</p>
                      <div className="mt-1.5 flex h-[18px] items-center">
                        {card.metaNode ? card.metaNode : <p className="truncate text-[11px] text-muted">{card.meta}</p>}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <motion.div
            className="grid grid-cols-1 gap-3 xl:grid-cols-2"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.38, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }}
          >
            <motion.section className="command-center-panel flex min-h-0 flex-col p-3" whileHover={reduceMotion ? undefined : { y: -4, scale: 1.004 }}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-ink md:text-base">Use Case Readiness Status</h3>
                <button
                  type="button"
                  onClick={() => navigate("/use-cases")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-text transition-colors duration-200 hover:text-primary"
                >
                  View repository
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {commandCenterModel.statusRows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">No readiness data available yet.</p>
              ) : (
                <div className="space-y-2">
                  {commandCenterModel.statusRows.map((status) => (
                    <div key={status.key}>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <p className="truncate font-medium text-ink">{status.label}</p>
                        <p className="tabular-nums text-muted">{status.count} ({status.percent}%)</p>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-border/55">
                        <div
                          className="h-full rounded-full bg-primary/85"
                          style={{ width: `${Math.min(status.percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            <motion.section className="command-center-panel flex min-h-0 flex-col p-3" whileHover={reduceMotion ? undefined : { y: -4, scale: 1.004 }}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-ink md:text-base">Domain / Portfolio Coverage</h3>
                <button
                  type="button"
                  onClick={() => navigate("/use-cases")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-text transition-colors duration-200 hover:text-primary"
                >
                  View all domains
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {commandCenterModel.domainRows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">No domain coverage data available yet.</p>
              ) : (
                <div className="panel-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                  {commandCenterModel.domainRows.map((domain) => {
                    const share = commandCenterModel.totalUseCases > 0
                      ? Math.round((domain.count / commandCenterModel.totalUseCases) * 100)
                      : 0;

                    return (
                      <button
                        key={domain.name}
                        type="button"
                        disabled={domain.isOthers}
                        onClick={() => navigate(`/use-cases?domain=${encodeURIComponent(domain.name)}`)}
                        className="w-full rounded-xl border border-border bg-surface-elevated/80 px-2.5 py-2 text-left transition-all duration-200 hover:border-border-strong disabled:cursor-default"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <p className="truncate font-medium text-ink">{domain.name}</p>
                          <p className="tabular-nums text-muted">{domain.count} ({share}%)</p>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-border/55">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary/85 to-[rgb(var(--color-gradient-via))]/70"
                            style={{ width: `${Math.min(share, 100)}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.section>

            <motion.section className="command-center-panel flex min-h-0 flex-col p-3" whileHover={reduceMotion ? undefined : { y: -4, scale: 1.004 }}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-ink md:text-base">Quality & Governance</h3>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate("/use-cases?review=incomplete")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-text transition-colors duration-200 hover:text-primary"
                  >
                    Quality review
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-border/70 bg-surface-elevated/80 px-2.5 py-2">
                <div className="flex items-end justify-between gap-2">
                  <p className="text-xs font-medium text-muted">Repository Quality Score</p>
                  <p className="font-display text-lg font-semibold leading-none text-ink">{commandCenterModel.qualityScore}%</p>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-border/55">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/65 via-primary/85 to-primary-text/75"
                    style={{ width: `${Math.min(commandCenterModel.qualityScore, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                {commandCenterModel.governanceRows.map((item) => (
                  <article key={item.label} className="rounded-lg border border-border/70 bg-surface-elevated/75 px-2.5 py-2">
                    <p className="text-[11px] text-muted">{item.label}</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">{item.count}</p>
                  </article>
                ))}
              </div>

              <div className="mt-2.5 min-h-[56px] rounded-lg border border-border/70 bg-surface-elevated/75 px-2.5 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">What to do next</p>
                {commandCenterModel.nextActions.length === 0 ? (
                  <p className="mt-1 text-xs text-ink">Repository quality looks healthy. Continue regular update reviews.</p>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-xs text-ink">
                    {commandCenterModel.nextActions.map((action) => (
                      <li key={action} className="flex items-start gap-1.5">
                        <AlertTriangle className="mt-[1px] h-3.5 w-3.5 flex-shrink-0 text-warning" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.section>

            <motion.section className="command-center-panel flex min-h-0 flex-col p-3" whileHover={reduceMotion ? undefined : { y: -4, scale: 1.004 }}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-ink md:text-base">Recent Activity</h3>
                <button
                  type="button"
                  onClick={() => navigate("/use-cases?sortBy=updated_at&sortOrder=desc")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-text transition-colors duration-200 hover:text-primary"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {commandCenterModel.recentlyUpdated.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">No recent activity available yet.</p>
              ) : (
                <div className="panel-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                  {commandCenterModel.recentlyUpdated.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(`/use-cases/${item.id}`)}
                      className="w-full rounded-xl border border-border bg-surface-elevated/80 px-2.5 py-2 text-left transition-all duration-200 hover:border-border-strong"
                    >
                      <p className="line-clamp-1 text-xs font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{item.domain || "Unknown domain"} • {item.client_name || "Unknown client"}</p>
                      <p className="mt-0.5 text-[11px] text-muted">Updated {formatRelativeDate(item.updated_at || item.created_at)}</p>
                    </button>
                  ))}
                </div>
              )}
            </motion.section>
          </motion.div>

        </div>
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
