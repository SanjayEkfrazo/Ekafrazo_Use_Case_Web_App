// Use Cases page: lists all use cases with search, sort, and pagination
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchUseCases, fetchUseCaseDomains, deleteUseCase } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_PAGE_SIZE } from "../utils/constants";

const ALL_DOMAINS = "All Domains";

function UseCaseList() {
  const [useCases, setUseCases] = useState([]);
  const [domains, setDomains] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(ALL_DOMAINS);
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [useCaseToDelete, setUseCaseToDelete] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  // Load use cases from the API using the current filters
  const loadUseCases = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchUseCases({
        search,
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
  }, [search, selectedDomain, sortBy, sortOrder, page, showToast]);

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
    loadDomains();
  }, [loadDomains]);

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

  // Toggle sort order when the same column is clicked again
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Confirm and perform the delete action
  const handleConfirmDelete = async () => {
    try {
      await deleteUseCase(useCaseToDelete.id);
      showToast("Use case deleted successfully");
      setUseCaseToDelete(null);
      loadUseCases();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="page-enter">
      <Navbar title="Use Cases" subtitle="Browse, search, and manage every business use case" />

      <div className="p-6 md:p-8">
        {/* Toolbar: search and create button */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={handleSearchChange} />
            <select
              value={selectedDomain}
              onChange={handleDomainChange}
              aria-label="Filter by domain"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink transition-all duration-200 ease-out focus:border-primary focus:shadow-glow-primary motion-reduce:transition-none sm:max-w-[220px]"
            >
              <option value={ALL_DOMAINS}>{ALL_DOMAINS}</option>
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
          {isAdmin && <Button onClick={() => navigate("/use-cases/new")}>+ New Use Case</Button>}
        </div>

        {isLoading ? (
          <Loader rows={6} />
        ) : useCases.length === 0 ? (
          <EmptyState
            title="No use cases found"
            description={
              search || selectedDomain !== ALL_DOMAINS
                ? "Try adjusting your search term or Domain Type filter."
                : isAdmin
                  ? "Create your first use case to get started."
                  : "No use cases available yet."
            }
            actionLabel={search || !isAdmin ? undefined : "Create Use Case"}
            onAction={() => navigate("/use-cases/new")}
          />
        ) : (
          <>
            <Table
              useCases={useCases}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Confirmation dialog before deleting */}
      <ConfirmDialog
        isOpen={isAdmin && Boolean(useCaseToDelete)}
        title="Delete this use case?"
        description={`"${useCaseToDelete?.title}" will be permanently removed. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUseCaseToDelete(null)}
      />
    </div>
  );
}

export default UseCaseList;
