// Use Cases page: lists all use cases with search, sort, and pagination
import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import Modal from "../components/Modal";
import PageHeaderCard from "../components/dashboard/PageHeaderCard";
import { fetchUseCases, fetchUseCaseDomains } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { DEFAULT_PAGE_SIZE } from "../utils/constants";

const ALL_DOMAINS = "All Domains";
const ALL_CLIENTS = "All Clients";
const REVIEW_KINDS = new Set(["deployment", "presentation", "image", "incomplete"]);

const REVIEW_LABELS = {
  deployment: "Demo Link Missing",
  presentation: "Presentation Link Missing",
  image: "Image Missing",
  incomplete: "Details Incomplete",
};

function toPositiveNumberOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function hasCoreDetailsGap(item) {
  return ["title", "description", "domain", "client_name", "technology_stack"]
    .some((field) => !String(item?.[field] || "").trim());
}

function matchesReviewKind(item, reviewKind) {
  if (reviewKind === "deployment") {
    return !String(item?.deployment_url || "").trim();
  }
  if (reviewKind === "presentation") {
    return !String(item?.resource_url || "").trim();
  }
  if (reviewKind === "image") {
    return !String(item?.domain_image_url || "").trim();
  }
  if (reviewKind === "incomplete") {
    return (
      hasCoreDetailsGap(item)
      || !String(item?.deployment_url || "").trim()
      || !String(item?.resource_url || "").trim()
      || !String(item?.domain_image_url || "").trim()
    );
  }
  return true;
}

async function fetchAllUseCasesForFilters({ search, domain, sortBy, sortOrder }) {
  const collected = [];
  const pageSize = 100;
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await fetchUseCases({
      search,
      domain,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize,
    });
    collected.push(...(response?.data || []));
    totalPages = Number(response?.pagination?.totalPages || 1);
    currentPage += 1;
  } while (currentPage <= totalPages);

  return collected;
}

function UseCaseList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialDomain = searchParams.get("domain") || ALL_DOMAINS;
  const initialClient = searchParams.get("client") || ALL_CLIENTS;
  const initialPage = toPositiveNumberOrFallback(searchParams.get("page"), 1);
  const reviewFromParams = (searchParams.get("review") || "").trim();
  const initialReview = REVIEW_KINDS.has(reviewFromParams) ? reviewFromParams : "";

  const [useCases, setUseCases] = useState([]);
  const [domains, setDomains] = useState([]);
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [selectedClient, setSelectedClient] = useState(initialClient);
  const [page, setPage] = useState(initialPage);
  const [reviewFilter, setReviewFilter] = useState(initialReview);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listMotionDirection, setListMotionDirection] = useState(1);
  const handledToastLocationKeyRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { isAdmin, unlockAdmin, lockAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const hasActiveFilters = search.trim() || selectedDomain !== ALL_DOMAINS || selectedClient !== ALL_CLIENTS || page > 1 || Boolean(reviewFilter);
  const listTransitionKey = [debouncedSearch.trim(), selectedDomain, selectedClient, reviewFilter, pagination.currentPage].join("|");

  // Load use cases from the API using the current filters
  const loadUseCases = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await fetchAllUseCasesForFilters({
        search: "",
        domain: selectedDomain === ALL_DOMAINS ? "" : selectedDomain,
        sortBy: "updated_at",
        sortOrder: "desc",
      });

      const titleTerm = debouncedSearch.trim().toLowerCase();
      const filtered = records.filter((item) => {
        const matchesTitle = !titleTerm || String(item?.title || "").toLowerCase().includes(titleTerm);
        const matchesClient = selectedClient === ALL_CLIENTS || String(item?.client_name || "") === selectedClient;
        const matchesReview = !reviewFilter || matchesReviewKind(item, reviewFilter);
        return matchesTitle && matchesClient && matchesReview;
      });

      const totalPages = Math.max(1, Math.ceil(filtered.length / DEFAULT_PAGE_SIZE));
      const currentPage = Math.min(page, totalPages);
      const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
      const end = start + DEFAULT_PAGE_SIZE;

      setUseCases(filtered.slice(start, end));
      setPagination({ totalPages, currentPage });

      if (currentPage !== page) {
        setPage(currentPage);
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedClient, selectedDomain, page, reviewFilter, showToast]);

  const loadDomains = useCallback(async () => {
    try {
      const response = await fetchUseCaseDomains();
      setDomains(response.data || []);
    } catch (error) {
      showToast(error.message, "error");
    }
  }, [showToast]);

  const loadClients = useCallback(async () => {
    try {
      const allRecords = await fetchAllUseCasesForFilters({
        search: "",
        domain: "",
        sortBy: "updated_at",
        sortOrder: "desc",
      });

      const uniqueClients = Array.from(
        new Set(
          allRecords
            .map((item) => String(item?.client_name || "").trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      setClients(uniqueClients);
    } catch (error) {
      showToast(error.message, "error");
    }
  }, [showToast]);

  useEffect(() => {
    loadUseCases();
  }, [loadUseCases]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    if (selectedDomain !== ALL_DOMAINS) {
      params.set("domain", selectedDomain);
    }
    if (selectedClient !== ALL_CLIENTS) {
      params.set("client", selectedClient);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    if (reviewFilter) {
      params.set("review", reviewFilter);
    }
    setSearchParams(params, { replace: true });
  }, [search, selectedDomain, selectedClient, page, reviewFilter, setSearchParams]);

  useEffect(() => {
    const toast = location.state?.toast;
    if (!toast?.message) {
      return;
    }

    if (handledToastLocationKeyRef.current === location.key) {
      return;
    }

    handledToastLocationKeyRef.current = location.key;

    showToast(toast.message, toast.type || "success");
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location.key, location.pathname, location.search, location.state, navigate, showToast]);

  // Reset back to page 1 whenever the search term changes
  const handleSearchChange = (value) => {
    setListMotionDirection(1);
    setSearch(value);
    setPage(1);
  };

  // Reset back to page 1 whenever domain filter changes
  const handleDomainChange = (event) => {
    setListMotionDirection(1);
    setSelectedDomain(event.target.value);
    setPage(1);
  };

  const handleClientChange = (event) => {
    setListMotionDirection(1);
    setSelectedClient(event.target.value);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setListMotionDirection(nextPage >= pagination.currentPage ? 1 : -1);
    setPage(nextPage);
  };

  const handleResetFilters = () => {
    setListMotionDirection(-1);
    setSearch("");
    setSelectedDomain(ALL_DOMAINS);
    setSelectedClient(ALL_CLIENTS);
    setPage(1);
    setReviewFilter("");
  };

  const handleClearSingleFilter = (kind) => {
    setListMotionDirection(-1);
    if (kind === "search") {
      setSearch("");
    }
    if (kind === "domain") {
      setSelectedDomain(ALL_DOMAINS);
    }
    if (kind === "client") {
      setSelectedClient(ALL_CLIENTS);
    }
    if (kind === "review") {
      setReviewFilter("");
    }
    setPage(1);
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

  return (
    <>
      <div className="usecase-auto-shell">
        <div className="p-2 md:p-3">
          <PageHeaderCard
            title="Use Case Repository"
            subtitle="Search and browse business use cases"
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
        </div>

        <div className="p-4 md:p-6">
          <div className="mb-4 rounded-2xl border border-border bg-surface p-3 shadow-card md:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 xl:max-w-4xl xl:grid-cols-3">
                <div>
                  <SearchBar
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Filter by title"
                  />
                </div>

                <select
                  value={selectedDomain}
                  onChange={handleDomainChange}
                  aria-label="Filter by domain"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink transition-all duration-200 ease-out focus:border-primary focus:shadow-glow-primary motion-reduce:transition-none"
                >
                  <option value={ALL_DOMAINS}>{ALL_DOMAINS}</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedClient}
                  onChange={handleClientChange}
                  aria-label="Filter by client"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink transition-all duration-200 ease-out focus:border-primary focus:shadow-glow-primary motion-reduce:transition-none"
                >
                  <option value={ALL_CLIENTS}>{ALL_CLIENTS}</option>
                  {clients.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {hasActiveFilters && (
                  <Button disableMotion variant="secondary" className="w-full px-3 py-2 text-xs sm:w-auto hover:!translate-y-0" onClick={handleResetFilters}>
                    Clear Filters
                  </Button>
                )}
                {isAdmin && <Button disableMotion onClick={() => navigate("/use-cases/new")} className="w-full xl:w-auto hover:!translate-y-0">Create Use Case</Button>}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted">
              <p>
                Showing {useCases.length} record{useCases.length === 1 ? "" : "s"}
                {selectedDomain !== ALL_DOMAINS ? ` in ${selectedDomain}` : " across all domains"}
                {selectedClient !== ALL_CLIENTS ? ` • Client: ${selectedClient}` : ""}
                {reviewFilter ? ` • Filter: ${REVIEW_LABELS[reviewFilter]}` : ""}
              </p>
              <p>Page {pagination.currentPage} of {pagination.totalPages}</p>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={() => handleClearSingleFilter("search")}
                    className="filter-chip-motion"
                  >
                    Search: {search.trim()} x
                  </button>
                ) : null}

                {selectedDomain !== ALL_DOMAINS ? (
                  <button
                    type="button"
                    onClick={() => handleClearSingleFilter("domain")}
                    className="filter-chip-motion"
                  >
                    Domain: {selectedDomain} x
                  </button>
                ) : null}

                {selectedClient !== ALL_CLIENTS ? (
                  <button
                    type="button"
                    onClick={() => handleClearSingleFilter("client")}
                    className="filter-chip-motion"
                  >
                    Client: {selectedClient} x
                  </button>
                ) : null}

                {reviewFilter ? (
                  <button
                    type="button"
                    onClick={() => handleClearSingleFilter("review")}
                    className="filter-chip-motion"
                  >
                    Filter: {REVIEW_LABELS[reviewFilter]} x
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {isLoading ? (
            <Loader rows={6} />
          ) : useCases.length === 0 ? (
            <EmptyState
              title="No matching use cases"
              description={
                search || selectedDomain !== ALL_DOMAINS || selectedClient !== ALL_CLIENTS
                  ? "No use cases match your search. Try changing the search or filters."
                  : reviewFilter
                    ? `No records found for ${REVIEW_LABELS[reviewFilter]}.`
                  : isAdmin
                    ? "No use cases yet. Create your first use case to get started."
                    : "No use cases available yet."
              }
              actionLabel={search || !isAdmin ? undefined : "Create Use Case"}
              onAction={() => navigate("/use-cases/new")}
            />
          ) : (
            <>
              <Table
                useCases={useCases}
                transitionKey={listTransitionKey}
                direction={listMotionDirection}
              />
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </>
          )}
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

export default UseCaseList;
