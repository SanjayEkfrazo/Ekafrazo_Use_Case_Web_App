// Use Cases page: lists all use cases with search, sort, and pagination
import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import PageNavCard from "../components/PageNavCard";
import { fetchUseCases, fetchUseCaseDomains } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
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

const QUICK_PRESETS = [
  { id: "all", label: "All Records", review: "" },
  { id: "deployment", label: "Missing Demo", review: "deployment" },
  { id: "presentation", label: "Missing Presentation", review: "presentation" },
  { id: "image", label: "Missing Image", review: "image" },
  { id: "incomplete", label: "Incomplete", review: "incomplete" },
];

const LIST_FILTERS_KEY = "usecase:list:filters";

function getStoredListFilters() {
  try {
    const raw = localStorage.getItem(LIST_FILTERS_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function getInitialViewMode() {
  const saved = localStorage.getItem("usecase:list:viewMode");
  return saved === "table" ? "table" : "card";
}

function getInitialQuickPreset(initialReview) {
  if (initialReview && REVIEW_KINDS.has(initialReview)) {
    return initialReview;
  }
  const saved = localStorage.getItem("usecase:list:quickPreset");
  if (saved === "all" || REVIEW_KINDS.has(saved)) {
    return saved;
  }
  return "all";
}

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
  const storedFilters = getStoredListFilters();

  const initialSearch = searchParams.get("search") || storedFilters?.search || "";
  const initialDomain = searchParams.get("domain") || storedFilters?.selectedDomain || ALL_DOMAINS;
  const initialClient = searchParams.get("client") || storedFilters?.selectedClient || ALL_CLIENTS;
  const initialPage = toPositiveNumberOrFallback(searchParams.get("page") || storedFilters?.page, 1);
  const reviewFromParams = (searchParams.get("review") || "").trim();
  const savedQuickPreset = localStorage.getItem("usecase:list:quickPreset") || "";
  const storedReview = String(storedFilters?.reviewFilter || "").trim();
  const initialReview = REVIEW_KINDS.has(reviewFromParams)
    ? reviewFromParams
    : (REVIEW_KINDS.has(storedReview) ? storedReview : (REVIEW_KINDS.has(savedQuickPreset) ? savedQuickPreset : ""));

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
  const [listMotionDirection, setListMotionDirection] = useState(1);
  const [viewMode, setViewMode] = useState(() => {
    const storedViewMode = storedFilters?.viewMode;
    if (storedViewMode === "card" || storedViewMode === "table") {
      return storedViewMode;
    }
    return getInitialViewMode();
  });
  const [quickPreset, setQuickPreset] = useState(() => getInitialQuickPreset(initialReview));
  const handledToastLocationKeyRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

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

      localStorage.setItem(
        "usecase:list:orderedIds",
        JSON.stringify(
          filtered
            .map((item) => item?.id)
            .filter((value) => value !== null && value !== undefined)
            .map((value) => String(value))
        )
      );

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

    const query = params.toString();
    localStorage.setItem("usecase:list:lastQuery", query ? `?${query}` : "");
  }, [search, selectedDomain, selectedClient, page, reviewFilter, setSearchParams]);

  useEffect(() => {
    localStorage.setItem(
      LIST_FILTERS_KEY,
      JSON.stringify({
        search,
        selectedDomain,
        selectedClient,
        page,
        reviewFilter,
        viewMode,
      })
    );
  }, [search, selectedDomain, selectedClient, page, reviewFilter, viewMode]);

  useEffect(() => {
    localStorage.setItem("usecase:list:viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("usecase:list:quickPreset", quickPreset);
  }, [quickPreset]);

  useEffect(() => {
    if (reviewFilter) {
      setQuickPreset(reviewFilter);
      return;
    }
    setQuickPreset("all");
  }, [reviewFilter]);

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

  const handleQuickPreset = (presetId) => {
    const preset = QUICK_PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setListMotionDirection(1);
    setQuickPreset(preset.id);
    setReviewFilter(preset.review);
    setPage(1);
  };

  const getQuickPresetClassName = (presetId, isActive) => {
    if (!isActive) {
      return "btn-preset-inactive";
    }

    if (presetId === "all") {
      return "btn-preset-all";
    }
    if (presetId === "deployment") {
      return "btn-preset-deployment";
    }
    if (presetId === "presentation") {
      return "btn-preset-presentation";
    }
    if (presetId === "image") {
      return "btn-preset-image";
    }
    if (presetId === "incomplete") {
      return "btn-preset-incomplete";
    }

    return "btn-preset-inactive";
  };

  const getFilterChipToneClass = (kind) => {
    if (kind === "search") {
      return "btn-chip-search";
    }
    if (kind === "domain") {
      return "btn-chip-domain";
    }
    if (kind === "client") {
      return "btn-chip-client";
    }
    if (kind === "review") {
      return "btn-chip-review";
    }
    return "";
  };

  return (
    <>
      <div className="usecase-auto-shell">
        <PageNavCard
          title="Use Case Library"
          subtitle="Search and explore all data and AI use cases."
          extraActions={isAdmin ? <Button onClick={() => navigate("/use-cases/new")} className="h-9 px-3 text-xs">Create New</Button> : null}
        />

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
                <div className="inline-flex rounded-lg border border-border bg-surface-elevated p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("card")}
                    aria-pressed={viewMode === "card"}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${viewMode === "card" ? "btn-toggle-card-active" : "btn-toggle-card-inactive"}`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    aria-pressed={viewMode === "table"}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${viewMode === "table" ? "btn-toggle-table-active" : "btn-toggle-table-inactive"}`}
                  >
                    Table
                  </button>
                </div>
                {hasActiveFilters && (
                  <Button disableMotion variant="secondary" className="w-full px-3 py-2 text-xs sm:w-auto hover:!translate-y-0" onClick={handleResetFilters}>
                    Clear Filters
                  </Button>
                )}
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

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleQuickPreset(preset.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${getQuickPresetClassName(preset.id, quickPreset === preset.id)}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={() => handleClearSingleFilter("search")}
                    className={`filter-chip-motion ${getFilterChipToneClass("search")}`}
                  >
                    Search: {search.trim()} x
                  </button>
                ) : null}

                {selectedDomain !== ALL_DOMAINS ? (
                  <button
                    type="button"
                    onClick={() => handleClearSingleFilter("domain")}
                    className={`filter-chip-motion ${getFilterChipToneClass("domain")}`}
                  >
                    Domain: {selectedDomain} x
                  </button>
                ) : null}

                {selectedClient !== ALL_CLIENTS ? (
                  <button
                    type="button"
                    onClick={() => handleClearSingleFilter("client")}
                    className={`filter-chip-motion ${getFilterChipToneClass("client")}`}
                  >
                    Client: {selectedClient} x
                  </button>
                ) : null}

                {reviewFilter ? (
                  <button
                    type="button"
                    onClick={() => handleClearSingleFilter("review")}
                    className={`filter-chip-motion ${getFilterChipToneClass("review")}`}
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
                viewMode={viewMode}
              />
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>

    </>
  );
}

export default UseCaseList;
