// Use Case details page: shows full information for one use case
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Loader from "../components/Loader";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import Navbar from "../components/Navbar";
import ImageCarousel from "../components/ImageCarousel";
import { fetchUseCaseById, deleteUseCase, fetchDomainMedia } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import useAutoMotionState from "../hooks/useAutoMotionState";

function UseCaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const reduceMotion = useReducedMotion();
  const { isIdle, tick } = useAutoMotionState({ enabled: !reduceMotion, idleMs: 3200, tickMs: 2100 });

  const [useCase, setUseCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [domainImages, setDomainImages] = useState([]);

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

  const toInitials = (domainValue) => {
    const domain = normalize(domainValue);
    if (!domain) {
      return "NA";
    }
    const parts = domain
      .split(/\s+/)
      .map((word) => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("");
    return (parts || domain.slice(0, 2)).toUpperCase();
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

  const handleCopyLink = async () => {
    const pageUrl = window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
      } else {
        const input = document.createElement("input");
        input.value = pageUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }

      showToast("Link copied");
    } catch (error) {
      showToast("Unable to copy link", "error");
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function loadUseCase() {
      try {
        const response = await fetchUseCaseById(id);
        const data = response.data;
        if (isCancelled) {
          return;
        }

        setUseCase(data);
        const currentDomain = String(data?.domain || "").trim();

        if (currentDomain) {
          try {
            const mediaResponse = await fetchDomainMedia({ domain: currentDomain });
            if (!isCancelled) {
              setDomainImages((mediaResponse?.data || []).map((item) => String(item.image_url || "").trim()).filter(Boolean));
            }
          } catch (_error) {
            if (!isCancelled) {
              setDomainImages([]);
            }
          }
        } else {
          setDomainImages([]);
        }

      } catch (error) {
        showToast(error.message, "error");
        navigate("/use-cases");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUseCase();

    return () => {
      isCancelled = true;
    };
  }, [id, navigate, showToast]);

  const deploymentUrl = normalize(useCase?.deployment_url);
  const resourceUrl = normalize(useCase?.resource_url);

  const shouldSwapLinks =
    deploymentUrl &&
    resourceUrl &&
    isFileLikeUrl(deploymentUrl) &&
    !isFileLikeUrl(resourceUrl);

  const resolvedDeploymentUrl = shouldSwapLinks ? resourceUrl : deploymentUrl;
  const resolvedResourceUrl = shouldSwapLinks ? deploymentUrl : resourceUrl;
  const demoActionClass = "mt-2 inline-flex w-full items-center justify-center rounded-lg border border-primary/35 bg-primary/12 px-3 py-2 text-sm font-semibold text-primary-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/18 motion-reduce:transform-none motion-reduce:transition-none";
  const presentationActionClass = "mt-2 inline-flex w-full items-center justify-center rounded-lg border border-primary/35 bg-primary/12 px-3 py-2 text-sm font-semibold text-primary-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/18 motion-reduce:transform-none motion-reduce:transition-none";
  const techStackItems = normalize(useCase?.technology_stack)
    .split(/[,;|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const handleConfirmDelete = async () => {
    if (!useCase?.id || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUseCase(useCase.id);
      showToast("Use case deleted successfully");
      navigate("/use-cases");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const autoPanelIndex = isIdle ? tick % 4 : -1;

  return (
    <div className="usecase-auto-shell min-h-full">
      <Navbar compact title="Use Case Details" subtitle="Review business summary, technology, and resources" />

      <motion.div
        className="p-4 md:p-6"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? {} : { opacity: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } }}
      >
        <div className="mx-auto w-full max-w-6xl usecase-auto-stage">
          <div className="usecase-stage-scan" aria-hidden />
          {isLoading ? (
            <Loader rows={6} />
          ) : (
            <section className="rounded-2xl border border-border bg-surface shadow-card">
              <div className="h-[3px] bg-brand-gradient" />

              <div className="space-y-4 p-4 md:p-5">
                <motion.header
                  className={`rounded-xl border border-border bg-surface-elevated p-4 md:p-5 ${autoPanelIndex === 0 ? "auto-panel-pulse" : ""}`}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
                  animate={reduceMotion ? {} : { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                >
                  <div className="mb-4 h-56 w-full md:h-72">
                    {domainImages.length > 0 ? (
                      <ImageCarousel
                        images={domainImages}
                        altBase={`${normalize(useCase.domain) || "Domain"} visual`}
                        className="h-full w-full"
                        autoPlayMs={5000}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface text-sm font-medium text-muted">
                        {`No image added yet • ${toInitials(useCase.domain)}`}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Case Study</p>
                      <h2 className="mt-1 break-words text-2xl font-semibold leading-tight text-ink [overflow-wrap:anywhere] md:text-[1.9rem]">{normalize(useCase.title) || "Untitled use case"}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink">
                        Updated: {useCase.updated_at ? formatDate(useCase.updated_at) : "Not available"}
                      </span>
                      <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="whitespace-nowrap"
                      >
                        Back to Use Cases
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleCopyLink}
                        className="whitespace-nowrap"
                      >
                        Copy Link
                      </Button>
                    </div>

                    <p className="text-sm leading-relaxed text-muted lg:col-span-2">{normalize(useCase.description) || "No summary added yet."}</p>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink">
                        Domain: {normalize(useCase.domain) || "Unknown"}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink">
                        Client: {normalize(useCase.client_name) || "Unknown"}
                      </span>
                      {normalize(useCase.status) && (
                        <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink">
                          Status: {normalize(useCase.status)}
                        </span>
                      )}
                      {normalize(useCase.priority) && (
                        <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink">
                          Priority: {normalize(useCase.priority)}
                        </span>
                      )}
                    </div>

                    {isAdmin ? (
                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Button
                          variant="primary"
                          onClick={() => navigate(`/use-cases/${useCase.id}/edit`)}
                          className="whitespace-nowrap"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={isDeleting}
                          className="whitespace-nowrap"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    ) : (
                      <div className="hidden lg:block" aria-hidden="true" />
                    )}
                  </div>
                </motion.header>

                <motion.section
                  className={`rounded-xl border border-border bg-surface-elevated p-4 ${autoPanelIndex === 1 ? "auto-panel-pulse" : ""}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={reduceMotion ? {} : { opacity: 1, transition: { duration: 0.34, delay: 0.08, ease: [0.22, 1, 0.36, 1] } }}
                >
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Business Overview</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{normalize(useCase.description) || "No summary added yet."}</p>
                </motion.section>

                <motion.section
                  className={`rounded-xl border border-border bg-surface-elevated p-4 ${autoPanelIndex === 2 ? "auto-panel-pulse" : ""}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={reduceMotion ? {} : { opacity: 1, transition: { duration: 0.34, delay: 0.14, ease: [0.22, 1, 0.36, 1] } }}
                >
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Technology Stack</h3>
                  {techStackItems.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {techStackItems.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-ink"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted">Not provided yet.</p>
                  )}
                </motion.section>

                <motion.section
                  className={`rounded-xl border border-border bg-surface-elevated p-4 ${autoPanelIndex === 3 ? "auto-panel-pulse" : ""}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={reduceMotion ? {} : { opacity: 1, transition: { duration: 0.34, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                >
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Resources</h3>
                  <div className="mt-2.5 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live Demo</p>
                      {resolvedDeploymentUrl ? (
                        <a
                          href={resolvedDeploymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={demoActionClass}
                        >
                          Open Demo
                        </a>
                      ) : (
                        <p className="mt-2 text-xs text-muted">Not provided by owner.</p>
                      )}
                    </div>

                    <div className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Presentation</p>
                      {resolvedResourceUrl ? (
                        <a
                          href={resolvedResourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={presentationActionClass}
                        >
                          Open Presentation
                        </a>
                      ) : (
                        <p className="mt-2 text-xs text-muted">Not provided by owner.</p>
                      )}
                    </div>
                  </div>
                </motion.section>

              </div>
            </section>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={isAdmin && showDeleteDialog}
        title="Delete this use case?"
        description={`"${useCase?.title || "This use case"}" will be permanently removed. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default UseCaseDetails;
