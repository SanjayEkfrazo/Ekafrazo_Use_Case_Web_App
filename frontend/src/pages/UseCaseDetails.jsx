// Use Case details page: shows full information for one use case
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import PageNavCard from "../components/PageNavCard";
import ImageCarousel from "../components/ImageCarousel";
import { fetchUseCaseById, deleteUseCase, fetchDomainMedia } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

function getOrderedIds() {
  try {
    const raw = localStorage.getItem("usecase:list:orderedIds");
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((value) => String(value)) : [];
  } catch (_error) {
    return [];
  }
}

function UseCaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [useCase, setUseCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [domainImages, setDomainImages] = useState([]);
  const [orderedIds, setOrderedIds] = useState([]);

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
    const lastQuery = localStorage.getItem("usecase:list:lastQuery") || "";
    navigate(`/use-cases${lastQuery}`);
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
    setOrderedIds(getOrderedIds());
  }, []);

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
  const demoActionClass = "mt-1.5 inline-flex w-full items-center justify-center rounded-lg border border-primary/35 bg-primary/12 px-3 py-2 text-sm font-semibold text-primary-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/18 motion-reduce:transform-none motion-reduce:transition-none";
  const presentationActionClass = "mt-1.5 inline-flex w-full items-center justify-center rounded-lg border border-primary/35 bg-primary/12 px-3 py-2 text-sm font-semibold text-primary-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/18 motion-reduce:transform-none motion-reduce:transition-none";
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

  const kpiItems = [
    { label: "Domain", value: normalize(useCase?.domain) || "Unknown" },
    { label: "Client", value: normalize(useCase?.client_name) || "Unknown" },
  ];

  const currentIndex = orderedIds.indexOf(String(id));
  const previousId = currentIndex > 0 ? orderedIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < orderedIds.length - 1 ? orderedIds[currentIndex + 1] : null;

  const handleGoPrevious = () => {
    if (!previousId) {
      return;
    }
    navigate(`/use-cases/${previousId}`);
  };

  const handleGoNext = () => {
    if (!nextId) {
      return;
    }
    navigate(`/use-cases/${nextId}`);
  };

  return (
    <div className="usecase-auto-shell usecase-details-page min-h-full">
      <PageNavCard
        compact
        className="px-3 py-1.5 md:px-4 md:py-2"
        title="Use Case Profile"
        subtitle="View the full use case profile, links, and related media."
        extraActions={(
          <>
            <Button variant="ghost" onClick={handleGoPrevious} disabled={!previousId} className="h-9 px-3 text-xs">Previous</Button>
            <Button variant="ghost" onClick={handleGoNext} disabled={!nextId} className="h-9 px-3 text-xs">Next</Button>
            <Button variant="secondary" onClick={handleBack} className="h-9 px-3 text-xs">Back to Library</Button>
          </>
        )}
      />

      <div className="px-3 pb-1 pt-1 md:px-4 md:pb-1.5 md:pt-1.5">
        <div className="w-full usecase-auto-stage">
          {isLoading ? (
            <Loader rows={6} />
          ) : (
            <section className="rounded-2xl border border-border bg-surface shadow-card">
              <div className="h-[3px] bg-brand-gradient" />

              <div className="space-y-2 p-2.5 md:space-y-2.5 md:p-3">
                <header className="w-full rounded-xl border border-border bg-surface-elevated p-2.5">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 w-full lg:flex-1">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Case Study</p>
                      <h2 className="mt-0.5 break-words text-xl font-semibold leading-tight text-ink [overflow-wrap:anywhere] md:text-2xl">{normalize(useCase.title) || "Untitled use case"}</h2>
                      </div>

                      <div className="flex min-w-0 items-center gap-2 whitespace-nowrap lg:justify-end">
                      <span className="shrink-0 text-xs font-medium text-muted whitespace-nowrap">
                        Updated {useCase?.updated_at ? formatDate(useCase.updated_at) : "Not available"}
                      </span>
                      <Button variant="ghost" onClick={handleCopyLink} className="h-8 whitespace-nowrap px-3 text-xs">Copy Link</Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="primary"
                            onClick={() => navigate(`/use-cases/${useCase.id}/edit`)}
                            className="h-8 whitespace-nowrap px-3 text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isDeleting}
                            className="h-8 whitespace-nowrap px-3 text-xs"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </>
                      )}
                      </div>
                    </div>

                    <p className="w-full text-sm leading-relaxed text-muted">{normalize(useCase.description) || "No summary added yet."}</p>
                  </div>
                </header>

                <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {kpiItems.map((item) => (
                    <article key={item.label} className="rounded-lg border border-border bg-surface-elevated px-2.5 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{item.label}</p>
                      <p className={`mt-1 text-sm font-semibold text-ink ${item.label === "Domain" || item.label === "Client" ? "break-words" : "line-clamp-1"}`}>{item.value}</p>
                    </article>
                  ))}
                </section>

                <div className="grid gap-2.5 xl:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
                  <section className="rounded-xl border border-border bg-surface-elevated p-2.5">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Domain Visual</h3>
                    <div className="mt-2 h-[220px] w-full lg:h-[248px]">
                      {domainImages.length > 0 ? (
                        <ImageCarousel
                          images={domainImages}
                          altBase={`${normalize(useCase.domain) || "Domain"} visual`}
                          className="h-full w-full"
                          autoPlayMs={5000}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface text-sm font-medium text-muted">
                          {`No image added yet | ${toInitials(useCase.domain)}`}
                        </div>
                      )}
                    </div>
                  </section>

                  <div className="space-y-2.5">
                    <section className="rounded-xl border border-border bg-surface-elevated p-2.5">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Technology Stack</h3>
                      {techStackItems.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {techStackItems.map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[11px] font-medium text-ink"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1.5 text-sm text-muted">Not provided yet.</p>
                      )}
                    </section>

                    <section className="rounded-xl border border-border bg-surface-elevated p-2.5">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Actions</h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-surface p-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Live Demo</p>
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
                            <p className="mt-2 text-xs text-muted">Not provided.</p>
                          )}
                        </div>

                        <div className="rounded-lg border border-border bg-surface p-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Presentation</p>
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
                            <p className="mt-2 text-xs text-muted">Not provided.</p>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
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
