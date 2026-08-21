// Use Case details page: shows full information for one use case
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import PageNavCard from "../components/PageNavCard";
import ImageCarousel from "../components/ImageCarousel";
import AccessGateDialog from "../components/AccessGateDialog";
import { fetchUseCaseById, deleteUseCase, fetchDomainMedia } from "../services/useCaseService";
import {
  fetchAccessSession,
  identifyAccessProfile,
  signinAccessProfile,
  signupAccessProfile,
} from "../services/accessService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

const ACCESS_PROFILE_KEY = "usecase:access:profile";

function readStoredAccessProfile() {
  try {
    const raw = localStorage.getItem(ACCESS_PROFILE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function saveAccessProfile(values) {
  const payload = {
    fullName: String(values?.fullName || "").trim(),
    workEmail: String(values?.workEmail || "").trim(),
    organization: String(values?.organization || "").trim(),
    purpose: String(values?.purpose || "").trim(),
    phone: String(values?.phone || "").trim(),
    department: String(values?.department || "").trim(),
    projectTimeline: String(values?.projectTimeline || "").trim(),
    notes: String(values?.notes || "").trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(ACCESS_PROFILE_KEY, JSON.stringify(payload));
  } catch (_error) {
    // Ignore storage failures and continue access flow.
  }
}

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
  const [isAccessGateOpen, setIsAccessGateOpen] = useState(false);
  const [accessMode, setAccessMode] = useState("signin");
  const [existingAccessProfile, setExistingAccessProfile] = useState(() => readStoredAccessProfile());
  const [pendingLink, setPendingLink] = useState(null);

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
  const demoActionClass = "btn-tone-view-details mt-1.5 inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none";
  const presentationActionClass = "btn-tone-view-details mt-1.5 inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none";
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

  const openExternalLink = (url) => {
    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const closeAccessGate = () => {
    setIsAccessGateOpen(false);
  };

  const handleAccessGateConfirm = async (submittedValues) => {
    const mode = String(submittedValues?.mode || "").trim();

    if (mode === "full" || mode === "signup") {
      const identifyResponse = await identifyAccessProfile({
        workEmail: String(submittedValues?.workEmail || "").trim(),
      });
      const alreadyExists = Boolean(identifyResponse?.data?.exists);

      if (alreadyExists) {
        setAccessMode("signin");
        setExistingAccessProfile((current) => ({
          ...(current || {}),
          fullName: String(submittedValues?.fullName || current?.fullName || "").trim(),
          workEmail: String(submittedValues?.workEmail || current?.workEmail || "").trim(),
        }));
        throw new Error("Account already exists for this email. Please sign in.");
      }

      await signupAccessProfile(submittedValues);
    }

    if (mode === "signin" || mode === "login") {
      // Backfill DB profile for legacy local-only users before signin.
      const fallbackProfile = {
        ...(existingAccessProfile || {}),
        fullName: String(submittedValues?.fullName || existingAccessProfile?.fullName || "").trim(),
        workEmail: String(submittedValues?.workEmail || existingAccessProfile?.workEmail || "").trim(),
      };

      if (
        String(fallbackProfile.organization || "").trim()
        && String(fallbackProfile.purpose || "").trim()
      ) {
        await signupAccessProfile(fallbackProfile);
      }

      await signinAccessProfile(submittedValues);
    }

    if (mode === "full" || mode === "signup") {
      saveAccessProfile(submittedValues);
      setExistingAccessProfile(readStoredAccessProfile());
    }

    const nextLink = pendingLink;
    closeAccessGate();

    if (nextLink?.url) {
      openExternalLink(nextLink.url);
      setPendingLink(null);
    }
  };

  const handleProtectedLinkClick = async (url, label) => {
    const safeUrl = normalize(url);
    if (!safeUrl) {
      return;
    }

    if (isAdmin) {
      openExternalLink(safeUrl);
      return;
    }

    try {
      const sessionResponse = await fetchAccessSession();
      if (sessionResponse?.data?.authenticated) {
        openExternalLink(safeUrl);
        return;
      }
    } catch (_error) {
      // Continue to access gate when session check fails.
    }

    setPendingLink({ url: safeUrl, label: String(label || "resource") });
    setExistingAccessProfile(readStoredAccessProfile());
    setAccessMode("signin");
    setIsAccessGateOpen(true);
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
            <Button variant="ghost" onClick={handleGoPrevious} disabled={!previousId} className="btn-tone-prev h-9 px-3 text-xs">Previous</Button>
            <Button variant="ghost" onClick={handleGoNext} disabled={!nextId} className="btn-tone-next h-9 px-3 text-xs">Next</Button>
            <Button variant="secondary" onClick={handleBack} className="btn-tone-back h-9 px-3 text-xs">Back to Library</Button>
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
                      <Button variant="ghost" onClick={handleCopyLink} className="btn-tone-copy h-8 whitespace-nowrap px-3 text-xs">Copy Link</Button>
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
                            variant="dangerSoft"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isDeleting}
                            className="btn-tone-delete-soft h-8 whitespace-nowrap px-3 text-xs"
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
                            <button
                              type="button"
                              onClick={() => handleProtectedLinkClick(resolvedDeploymentUrl, "deployment")}
                              className={demoActionClass}
                            >
                              Open Demo
                            </button>
                          ) : (
                            <p className="mt-2 text-xs text-muted">Not provided.</p>
                          )}
                        </div>

                        <div className="rounded-lg border border-border bg-surface p-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Presentation</p>
                          {resolvedResourceUrl ? (
                            <button
                              type="button"
                              onClick={() => handleProtectedLinkClick(resolvedResourceUrl, "presentation")}
                              className={presentationActionClass}
                            >
                              Open Presentation
                            </button>
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
        cancelClassName="btn-tone-modal-cancel"
        confirmClassName="btn-tone-delete-soft"
      />

      <AccessGateDialog
        isOpen={isAccessGateOpen}
        mode={accessMode}
        allowModeSwitch
        existingProfile={existingAccessProfile}
        onClose={closeAccessGate}
        onConfirm={handleAccessGateConfirm}
      />
    </div>
  );
}

export default UseCaseDetails;
