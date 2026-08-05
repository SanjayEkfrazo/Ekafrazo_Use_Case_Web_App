// Use Case details page: shows full information for one use case
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import Button from "../components/Button";
import { fetchUseCaseById } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";

function UseCaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  return (
    <div>
      <Navbar title="Use Case Details" subtitle="Review all details for this use case" />

      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          {isLoading ? (
            <Loader rows={5} />
          ) : (
            <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{useCase.title}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={useCase.status} />
                  <PriorityBadge priority={useCase.priority} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-border bg-white px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Domain</p>
                  <p className="mt-0.5 text-sm text-ink">{normalize(useCase.domain) || "Not provided yet"}</p>
                </div>
                <div className="rounded-md border border-border bg-white px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Client</p>
                  <p className="mt-0.5 text-sm text-ink">{normalize(useCase.client_name) || "Not provided yet"}</p>
                </div>
                <div className="rounded-md border border-border bg-white px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Title</p>
                  <p className="mt-0.5 text-sm text-ink">{normalize(useCase.title) || "Not provided yet"}</p>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-border bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Description</p>
                <p className="mt-1 text-sm text-ink">{normalize(useCase.description) || "No summary provided yet"}</p>
              </div>

              {(normalize(useCase.deployment_url) || normalize(useCase.resource_url)) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {normalize(useCase.deployment_url) && (
                    <a
                      href={useCase.deployment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                    >
                      Open Deploy
                    </a>
                  )}
                  {normalize(useCase.resource_url) && (
                    <a
                      href={useCase.resource_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50"
                    >
                      Open File
                    </a>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-sm text-muted">
                  Updated {useCase.updated_at ? formatDate(useCase.updated_at) : "Not available"}
                </p>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button variant="secondary" onClick={() => navigate("/use-cases")}>
                    Back to Use Cases
                  </Button>
                  <Button onClick={() => navigate(`/use-cases/${useCase.id}/edit`)}>Edit Use Case</Button>
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
