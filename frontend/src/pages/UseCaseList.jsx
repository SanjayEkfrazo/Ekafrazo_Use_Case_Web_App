// Use Cases page: lists all use cases with search, sort, and pagination
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const initialSortBy = searchParams.get("sortBy") || "updated_at";
  const initialSortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const initialPage = toPositiveNumberOrFallback(searchParams.get("page"), 1);
  const reviewFromParams = (searchParams.get("review") || "").trim();
  const initialReview = REVIEW_KINDS.has(reviewFromParams) ? reviewFromParams : "";

  const [useCases, setUseCases] = useState([]);
  const [domains, setDomains] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [page, setPage] = useState(initialPage);
  const [reviewFilter, setReviewFilter] = useState(initialReview);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin, unlockAdmin, lockAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const hasActiveFilters = search.trim() || selectedDomain !== ALL_DOMAINS || sortBy !== "updated_at" || sortOrder !== "desc" || page > 1 || Boolean(reviewFilter);

  const sortLabelMap = {
    updated_at: "Recently Updated",
    created_at: "Recently Added",
    title: "Title",
    domain: "Domain",
    client_name: "Client",
  };

  // Load use cases from the API using the current filters
  const loadUseCases = useCallback(async () => {
    setIsLoading(true);
    try {
      if (reviewFilter) {
        const records = await fetchAllUseCasesForFilters({
          search: debouncedSearch,
          domain: selectedDomain === ALL_DOMAINS ? "" : selectedDomain,
          sortBy,
          sortOrder,
        });

        const filtered = records.filter((item) => matchesReviewKind(item, reviewFilter));
        const totalPages = Math.max(1, Math.ceil(filtered.length / DEFAULT_PAGE_SIZE));
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
        const end = start + DEFAULT_PAGE_SIZE;

        setUseCases(filtered.slice(start, end));
        setPagination({ totalPages, currentPage });

        if (currentPage !== page) {
          setPage(currentPage);
        }

        return;
      }

      const response = await fetchUseCases({
        search: debouncedSearch,
        domain: selectedDomain === ALL_DOMAINS ? "" : selectedDomain,
        sortBy,
        sortOrder,
        page,
        limit: DEFAULT_PAGE_SIZE,
      });
      setUseCases(response.data);
      setPagination(response.pagination);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedDomain, sortBy, sortOrder, page, reviewFilter, showToast]);

  const loadDomains = useCallback(async () => {
    try {
      const response = await fetchUseCaseDomains();
      setDomains(response.data || []);
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
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    if (selectedDomain !== ALL_DOMAINS) {
      params.set("domain", selectedDomain);
    }
    if (sortBy !== "updated_at") {
      params.set("sortBy", sortBy);
    }
    if (sortOrder !== "desc") {
      params.set("sortOrder", sortOrder);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    if (reviewFilter) {
      params.set("review", reviewFilter);
    }
    setSearchParams(params, { replace: true });
  }, [search, selectedDomain, sortBy, sortOrder, page, reviewFilter, setSearchParams]);

  // Reset back to page 1 whenever the search term changes
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  // Reset back to page 1 whenever domain filter changes
  const handleDomainChange = (event) => {
    setSelectedDomain(event.target.value);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedDomain(ALL_DOMAINS);
    setSortBy("updated_at");
    setSortOrder("desc");
    setPage(1);
    setReviewFilter("");
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
      <div className="page-enter">
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
              <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 xl:max-w-4xl xl:grid-cols-4">
                <div className="md:col-span-2 xl:col-span-2">
                  <SearchBar
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search by title, domain, client, or technology"
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

                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value);
                      setPage(1);
                    }}
                    aria-label="Sort field"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink transition-all duration-200 ease-out focus:border-primary focus:shadow-glow-primary motion-reduce:transition-none"
                  >
                    <option value="updated_at">Recently Updated</option>
                    <option value="created_at">Recently Added</option>
                    <option value="title">Title</option>
                    <option value="domain">Domain</option>
                    <option value="client_name">Client</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
                      setPage(1);
                    }}
                    className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs font-semibold text-ink transition-all duration-200 hover:border-border-strong motion-reduce:transition-none"
                    aria-label="Toggle sort order"
                  >
                    {sortOrder === "asc" ? "Asc" : "Desc"}
                  </button>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {hasActiveFilters && (
                  <Button variant="secondary" className="w-full px-3 py-2 text-xs sm:w-auto" onClick={handleResetFilters}>
                    Clear Filters
                  </Button>
                )}
                {isAdmin && <Button onClick={() => navigate("/use-cases/new")} className="w-full xl:w-auto">Create Use Case</Button>}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted">
              <p>
                Showing {useCases.length} record{useCases.length === 1 ? "" : "s"}
                {selectedDomain !== ALL_DOMAINS ? ` in ${selectedDomain}` : " across all domains"}
                {reviewFilter ? ` • Filter: ${REVIEW_LABELS[reviewFilter]}` : ""}
              </p>
              <p>
                Sorted by {sortLabelMap[sortBy] || "Recently Updated"} ({sortOrder === "asc" ? "ascending" : "descending"}) • Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
          </div>

          {isLoading ? (
            <Loader rows={6} />
          ) : useCases.length === 0 ? (
            <EmptyState
              title="No matching use cases"
              description={
                search || selectedDomain !== ALL_DOMAINS
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
