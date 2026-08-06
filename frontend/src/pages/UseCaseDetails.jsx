// Use Case details page: shows full information for one use case
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import Button from "../components/Button";
import { fetchUseCaseById } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

function UseCaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [useCase, setUseCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (value) => {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const normalize = (value) => {
    if (!value) {
      return "";
    }
    return String(value).trim();
  };

  const isFileLikeUrl = (value) => {
    const url = normalize(value).toLowerCase();
    if (!url) {
      return false;
    }

    return /(drive\.google\.com|docs\.|sharepoint|dropbox|notion\.so|\.pdf($|\?)|\.pptx?($|\?)|\.docx?($|\?)|\.xlsx?($|\?))/.test(url);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/use-cases");
  };

  useEffect(() => {
    async function loadUseCase() {
      try {
        const response = await fetchUseCaseById(id);
        setUseCase(response.data);
      } catch (error) {
        showToast(error.message, "error");
        navigate("/use-cases");
      } finally {
        setIsLoading(false);
      }
    }

    loadUseCase();
  }, [id]);

  const deploymentUrl = normalize(useCase?.deployment_url);
  const resourceUrl = normalize(useCase?.resource_url);

  const shouldSwapLinks =
    deploymentUrl &&
    resourceUrl &&
    isFileLikeUrl(deploymentUrl) &&
    !isFileLikeUrl(resourceUrl);

  const resolvedDeploymentUrl = shouldSwapLinks ? resourceUrl : deploymentUrl;
  const resolvedResourceUrl = shouldSwapLinks ? deploymentUrl : resourceUrl;

  return (
    <div className="relative min-h-full">
      <div className="fixed inset-0 z-30 bg-ink/42 backdrop-blur-sm" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
            {isLoading ? (
              <Loader rows={5} />
            ) : (
              <section className="max-h-[90vh] overflow-y-auto rounded-2xl border border-border/80 bg-white/88 shadow-[0_16px_40px_rgba(16,24,40,0.12)] backdrop-blur-xl no-scrollbar">
              <div className="h-1 bg-gradient-to-r from-primary/75 to-primary-hover/70" />
              <div className="p-5 md:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Use Case</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink md:text-3xl">{useCase.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2 self-start sm:min-w-[260px]">
                    <div className="rounded-lg border border-border/80 bg-white px-2.5 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Status</p>
                      <div className="mt-1">
                        <StatusBadge status={useCase.status} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-white px-2.5 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Priority</p>
                      <div className="mt-1">
                        <PriorityBadge priority={useCase.priority} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/80 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Domain</p>
                    <p className="mt-0.5 text-sm text-ink">{normalize(useCase.domain) || "Not provided yet"}</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Client</p>
                    <p className="mt-0.5 text-sm text-ink">{normalize(useCase.client_name) || "Not provided yet"}</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Technology Stack</p>
                    <p className="mt-0.5 text-sm text-ink">{normalize(useCase.technology_stack) || "Not provided yet"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border/80 bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Description</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink">{normalize(useCase.description) || "No summary provided yet"}</p>
                </div>

                {(resolvedDeploymentUrl || resolvedResourceUrl) && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {resolvedDeploymentUrl && (
                      <a
                        href={resolvedDeploymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-xl border border-[#d8be83] bg-gradient-to-b from-[#1f4468] to-[#12314c] px-4 py-2 text-sm font-semibold text-[#fff8ea] shadow-[0_10px_22px_rgba(18,49,76,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#25517d] hover:to-[#174164] hover:shadow-[0_12px_24px_rgba(18,49,76,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8be83]/55"
                      >
                        Open Deployment
                      </a>
                    )}
                    {resolvedResourceUrl && (
                      <a
                        href={resolvedResourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-xl border border-[#dcc494] bg-gradient-to-b from-[#fffaf0] to-[#f5e7c9] px-4 py-2 text-sm font-semibold text-[#5a4014] shadow-[0_6px_16px_rgba(90,64,20,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#fff4df] hover:to-[#ecd8af] hover:text-[#47320f] hover:shadow-[0_8px_18px_rgba(90,64,20,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8be83]/45"
                      >
                        Open File
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                  <p className="text-sm text-muted">
                    Updated {useCase.updated_at ? formatDate(useCase.updated_at) : "Not available"}
                  </p>
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="secondary" onClick={handleBack}>
                      Back to Cards
                    </Button>
                    {isAdmin && <Button onClick={() => navigate(`/use-cases/${useCase.id}/edit`)}>Edit Use Case</Button>}
                  </div>
                </div>
              </div>
              </section>
            )}
        </div>
      </div>
    </div>
  );
}

export default UseCaseDetails;
