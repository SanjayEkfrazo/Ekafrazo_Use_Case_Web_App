// Business logic for use cases lives here
// The controller calls these functions instead of touching SQL directly

const usecaseDb = require("../database/usecase.database");
const { validateUseCase } = require("../utils/validators");
const { USE_CASE_FIELDS } = require("../models/usecase.model");

// Only keep fields that are allowed on a use case
function pickAllowedFields(data) {
  const clean = {};
  USE_CASE_FIELDS.forEach((field) => {
    clean[field] = data[field] !== undefined ? data[field] : "";
  });
  // Apply sensible defaults when status or priority are missing
  clean.status = clean.status || "Draft";
  clean.priority = clean.priority || "Medium";
  return clean;
}

// Fetch all use cases, then apply search, sort, and pagination in memory
// (Kept simple on purpose since this is an educational project)
function getUseCases({ search, sortBy, sortOrder, page, limit }) {
  let items = usecaseDb.findAll();

  // Filter by search term across title, domain, client, and deployment link
  if (search && search.trim() !== "") {
    const term = search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.domain.toLowerCase().includes(term) ||
        item.client_name.toLowerCase().includes(term) ||
        item.deployment_url.toLowerCase().includes(term)
    );
  }

  // Sort the results by the requested column
  const validSortColumns = ["title", "domain", "client_name", "deployment_url", "status", "priority", "updated_at", "created_at"];
  const column = validSortColumns.includes(sortBy) ? sortBy : "updated_at";
  const order = sortOrder === "asc" ? 1 : -1;

  items.sort((a, b) => {
    if (a[column] < b[column]) return -1 * order;
    if (a[column] > b[column]) return 1 * order;
    return 0;
  });

  // Paginate the sorted, filtered results
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const pageSize = Number(limit) > 0 ? Number(limit) : 10;
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    data: pagedItems,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      pageSize,
    },
  };
}

// Fetch a single use case by id
function getUseCaseById(id) {
  return usecaseDb.findById(id);
}

// Create a new use case after validating the input
function createUseCase(data) {
  const errors = validateUseCase(data);
  if (errors.length > 0) {
    return { errors };
  }
  const clean = pickAllowedFields(data);
  const created = usecaseDb.create(clean);
  return { data: created };
}

// Update an existing use case after validating the input
function updateUseCase(id, data) {
  const existing = usecaseDb.findById(id);
  if (!existing) {
    return { notFound: true };
  }

  const errors = validateUseCase(data);
  if (errors.length > 0) {
    return { errors };
  }

  const clean = pickAllowedFields(data);
  const updated = usecaseDb.update(id, clean);
  return { data: updated };
}

// Delete a use case by id
function deleteUseCase(id) {
  const existing = usecaseDb.findById(id);
  if (!existing) {
    return { notFound: true };
  }
  usecaseDb.remove(id);
  return { success: true };
}

// Build summary data for the Dashboard page
function getDashboardSummary() {
  const total = usecaseDb.count();
  const all = usecaseDb.findAll();
  const recentlyUpdated = all.slice(0, 6);

  const byStatus = all.reduce((accumulator, item) => {
    const key = item.status || "Draft";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const byPriority = all.reduce((accumulator, item) => {
    const key = item.priority || "Medium";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const completedCount = byStatus.Completed || 0;
  const inProgressCount = byStatus["In Progress"] || 0;
  const blockedCount = byStatus["On Hold"] || 0;

  const highPriorityOpenCount = all.filter(
    (item) => (item.priority === "Critical" || item.priority === "High") && item.status !== "Completed"
  ).length;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const updatedLast7Days = all.filter((item) => {
    if (!item.updated_at) {
      return false;
    }
    const updatedAt = new Date(item.updated_at.replace(" ", "T")).getTime();
    return Number.isFinite(updatedAt) && updatedAt >= sevenDaysAgo;
  }).length;

  const needsAttention = all
    .filter(
      (item) => item.status === "On Hold" || ((item.priority === "Critical" || item.priority === "High") && item.status !== "Completed")
    )
    .slice(0, 5);

  return {
    total,
    recentlyUpdated,
    byStatus,
    byPriority,
    completedCount,
    inProgressCount,
    blockedCount,
    highPriorityOpenCount,
    updatedLast7Days,
    needsAttention,
  };
}

module.exports = {
  getUseCases,
  getUseCaseById,
  createUseCase,
  updateUseCase,
  deleteUseCase,
  getDashboardSummary,
};
