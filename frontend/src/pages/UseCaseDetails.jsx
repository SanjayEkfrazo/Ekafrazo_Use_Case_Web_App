// Use Case details page: shows full information for one use case
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchUseCaseById, deleteUseCase } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

function UseCaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [useCase, setUseCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDomainImageBroken, setIsDomainImageBroken] = useState(false);
  const panelRef = useRef(null);

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

  useEffect(() => {
    async function loadUseCase() {
      try {
        const response = await fetchUseCaseById(id);
        setUseCase(response.data);
        setIsDomainImageBroken(false);
      } catch (error) {
        showToast(error.message, "error");
        navigate("/use-cases");
      } finally {
        setIsLoading(false);
      }
    }

    loadUseCase();
  }, [id]);

  useEffect(() => {
    if (isLoading || !useCase) {
      return undefined;
    }

    const previousFocused = document.activeElement;
    const focusables = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    const onKeyDown = (event) => {
      if (showDeleteDialog) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        handleBack();
        return;
      }

      if (event.key !== "Tab" || !focusables?.length) {
        return;
      }

      const activeIndex = Array.from(focusables).indexOf(document.activeElement);
      if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!event.shiftKey && activeIndex === focusables.length - 1) {
        event.preventDefault();
        focusables[0].focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocused && typeof previousFocused.focus === "function") {
        previousFocused.focus();
      }
    };
  }, [isLoading, useCase, showDeleteDialog]);

  const deploymentUrl = normalize(useCase?.deployment_url);
  const resourceUrl = normalize(useCase?.resource_url);

  const shouldSwapLinks =
    deploymentUrl &&
    resourceUrl &&
    isFileLikeUrl(deploymentUrl) &&
    !isFileLikeUrl(resourceUrl);

  const resolvedDeploymentUrl = shouldSwapLinks ? resourceUrl : deploymentUrl;
  const resolvedResourceUrl = shouldSwapLinks ? deploymentUrl : resourceUrl;
  const techStackItems = normalize(useCase?.technology_stack)
    .split(",")
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

  return (
    <div className="page-enter relative min-h-full">
      <div className="fixed inset-0 z-30 bg-overlay/70 backdrop-blur-md" />
      <div className="fixed inset-0 z-40 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto flex min-h-full w-full max-w-5xl items-start justify-center py-2 md:items-center md:py-6">
            {isLoading ? (
              <Loader rows={5} />
            ) : (
              <section ref={panelRef} className="rounded-2xl border border-border bg-surface-elevated shadow-card-hover">
              <div className="h-[3px] bg-brand-gradient" />
              <div className="p-5 md:p-7">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Use Case</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink md:text-3xl">{useCase.title}</h2>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-surface px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Domain</p>
                    <p className="mt-0.5 text-sm text-ink">{normalize(useCase.domain) || "Not provided yet"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Client / Company</p>
                    <p className="mt-0.5 text-sm text-ink">{normalize(useCase.client_name) || "Not provided yet"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Updated</p>
                    <p className="mt-0.5 font-mono text-xs text-ink">{useCase.updated_at ? formatDate(useCase.updated_at) : "Not available"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Description</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink">{normalize(useCase.description) || "No summary provided yet"}</p>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Technology Stack</p>
                  {techStackItems.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {techStackItems.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1 font-mono text-xs font-medium text-ink"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Not provided yet</p>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Domain Image</p>
                  {normalize(useCase.domain_image_url) && !isDomainImageBroken ? (
                    <a href={normalize(useCase.domain_image_url)} target="_blank" rel="noreferrer" className="mt-2 block">
                      <img
                        src={normalize(useCase.domain_image_url)}
                        alt={`${normalize(useCase.domain) || "Domain"} visual`}
                        className="h-32 w-full rounded-xl border border-border object-cover transition-transform duration-200 hover:scale-[1.01] motion-reduce:transition-none motion-reduce:transform-none"
                        onError={() => setIsDomainImageBroken(true)}
                      />
                    </a>
                  ) : (
                    <div className="mt-2 flex h-32 w-full items-center justify-center rounded-lg border border-border bg-surface-elevated text-sm font-medium text-muted">
                      {normalize(useCase.domain_image_url) ? `Image unavailable • ${toInitials(useCase.domain)}` : "No image added yet"}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-surface px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">Use Case Deployment URL</p>
                    {resolvedDeploymentUrl ? (
                      <a
                        href={resolvedDeploymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center rounded-xl bg-gradient-to-r from-primary to-brand-via px-4 py-2 text-sm font-semibold text-on-solid shadow-glow-primary transition-all duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                      >
                        Open Deployment
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-muted">Not provided yet</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-surface px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">Presentation / File URL</p>
                    {resolvedResourceUrl ? (
                      <a
                        href={resolvedResourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center rounded-xl bg-gradient-to-r from-brand-to to-warning px-4 py-2 text-sm font-semibold text-app shadow-glow-brand transition-all duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                      >
                        Open File
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-muted">Not provided yet</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border/70 pt-4">
                  <Button variant="ghost" onClick={handleBack}>
                    Back to Use Cases
                  </Button>
                  {isAdmin && (
                    <Button variant="danger" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete Use Case"}
                    </Button>
                  )}
                  {isAdmin && (
                    <Button variant="secondary" onClick={() => navigate(`/use-cases/${useCase.id}/edit`)}>
                      Edit Use Case
                    </Button>
                  )}
                </div>
              </div>
              </section>
            )}
        </div>
      </div>

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
