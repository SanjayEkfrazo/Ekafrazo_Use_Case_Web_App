// Use Case details page: shows full information for one use case
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import Navbar from "../components/Navbar";
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

  return (
    <div className="page-enter min-h-full">
      <Navbar compact title="Use Case Details" subtitle="Review business summary, technology, and resources" />

      <div className="p-4 md:p-6">
        <div className="mx-auto w-full max-w-6xl">
          {isLoading ? (
            <Loader rows={6} />
          ) : (
            <section className="rounded-2xl border border-border bg-surface shadow-card">
              <div className="h-[3px] bg-brand-gradient" />

              <div className="space-y-4 p-4 md:p-5">
                <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-surface-elevated p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Case Study</p>
                    <h2 className="mt-1 text-2xl font-semibold leading-tight text-ink md:text-[1.9rem]">{useCase.title}</h2>
                    <div className="mt-3 grid grid-cols-1 gap-1 text-sm text-muted sm:grid-cols-2 sm:gap-x-6">
                      <p><span className="font-medium text-ink">Domain:</span> {normalize(useCase.domain) || "Unknown domain"}</p>
                      <p><span className="font-medium text-ink">Client:</span> {normalize(useCase.client_name) || "Unknown client"}</p>
                      <p><span className="font-medium text-ink">Updated:</span> {useCase.updated_at ? formatDate(useCase.updated_at) : "Not available"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={handleBack}>Back</Button>
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
                  <div className="space-y-3">
                    <section className="rounded-xl border border-border bg-surface-elevated p-4">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Business Overview</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink">{normalize(useCase.description) || "No summary added yet."}</p>
                    </section>

                    <section className="rounded-xl border border-border bg-surface-elevated p-4">
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
                    </section>

                    {isAdmin && (
                      <section className="rounded-xl border border-border bg-surface-elevated p-4">
                        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Admin Actions</h3>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <Button variant="secondary" onClick={() => navigate(`/use-cases/${useCase.id}/edit`)}>Edit</Button>
                          <Button variant="danger" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </section>
                    )}
                  </div>

                  <aside className="space-y-3">
                    <section className="rounded-xl border border-border bg-surface-elevated p-4">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Live Demo</h3>
                      {resolvedDeploymentUrl ? (
                        <a
                          href={resolvedDeploymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary to-brand-via px-3 py-2 text-sm font-semibold text-on-solid"
                        >
                          Open Demo
                        </a>
                      ) : (
                        <p className="mt-1.5 text-xs text-muted">Live demo URL not provided.</p>
                      )}
                    </section>

                    <section className="rounded-xl border border-border bg-surface-elevated p-4">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Presentation</h3>
                      {resolvedResourceUrl ? (
                        <a
                          href={resolvedResourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink"
                        >
                          Open Presentation
                        </a>
                      ) : (
                        <p className="mt-1.5 text-xs text-muted">Presentation URL not provided.</p>
                      )}
                    </section>

                    <section className="rounded-xl border border-border bg-surface-elevated p-4">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Domain Image</h3>
                      {normalize(useCase.domain_image_url) && !isDomainImageBroken ? (
                        <a href={normalize(useCase.domain_image_url)} target="_blank" rel="noreferrer" className="mt-2.5 block">
                          <img
                            src={normalize(useCase.domain_image_url)}
                            alt={`${normalize(useCase.domain) || "Domain"} visual`}
                            className="h-52 w-full rounded-xl border border-border object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={() => setIsDomainImageBroken(true)}
                          />
                        </a>
                      ) : (
                        <div className="mt-2.5 flex h-52 w-full items-center justify-center rounded-lg border border-border bg-surface text-sm font-medium text-muted">
                          {normalize(useCase.domain_image_url) ? `Image not available • ${toInitials(useCase.domain)}` : "No image added yet"}
                        </div>
                      )}
                    </section>
                  </aside>
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
