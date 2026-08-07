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
  return clean;
}

// Fetch all use cases, then apply search, sort, and pagination in memory
// (Kept simple on purpose since this is an educational project)
function getUseCases({ search, domain, sortBy, sortOrder, page, limit }) {
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

  // Filter by an exact domain when provided
  if (domain && domain.trim() !== "") {
    const selectedDomain = domain.trim().toLowerCase();
    items = items.filter((item) => item.domain.toLowerCase() === selectedDomain);
  }

  // Sort the results by the requested column
  const validSortColumns = ["title", "domain", "client_name", "deployment_url", "resource_url", "updated_at", "created_at"];
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

// Return distinct domains that can be used as filter options
function getDomains() {
  return usecaseDb.findDistinctDomains();
}

// Fetch a single use case by id
function getUseCaseById(id) {
  return usecaseDb.findById(id);
}

function validateDomainImageUsage(data, currentId = null) {
  const imageUrl = String(data.domain_image_url || "").trim();
  const domain = String(data.domain || "").trim();

  if (!imageUrl || !domain) {
    return "";
  }

  const existingWithSameImage = usecaseDb.findByDomainImageUrl(imageUrl);
  if (!existingWithSameImage) {
    return "";
  }

  if (currentId && Number(existingWithSameImage.id) === Number(currentId)) {
    return "";
  }

  const existingDomain = String(existingWithSameImage.domain || "").trim().toLowerCase();
  const currentDomain = domain.toLowerCase();
  if (existingDomain !== currentDomain) {
    return "This image is already used for a different domain. Please upload/select a different image.";
  }

  return "";
}

// Create a new use case after validating the input
function createUseCase(data) {
  const errors = validateUseCase(data);
  const imageUsageError = validateDomainImageUsage(data);
  if (imageUsageError) {
    errors.push(imageUsageError);
  }
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
  const imageUsageError = validateDomainImageUsage(data, id);
  if (imageUsageError) {
    errors.push(imageUsageError);
  }
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

  const uniqueDomainCount = new Set(all.map((item) => (item.domain || "").trim().toLowerCase()).filter(Boolean)).size;
  const withDeploymentUrlCount = all.filter((item) => String(item.deployment_url || "").trim() !== "").length;
  const withResourceUrlCount = all.filter((item) => String(item.resource_url || "").trim() !== "").length;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const updatedLast7Days = all.filter((item) => {
    if (!item.updated_at) {
      return false;
    }
    const updatedAt = new Date(item.updated_at.replace(" ", "T")).getTime();
    return Number.isFinite(updatedAt) && updatedAt >= sevenDaysAgo;
  }).length;

  const needsAttention = all
    .filter((item) => String(item.deployment_url || "").trim() === "" || String(item.resource_url || "").trim() === "")
    .slice(0, 5);

  return {
    total,
    recentlyUpdated,
    uniqueDomainCount,
    withDeploymentUrlCount,
    withResourceUrlCount,
    updatedLast7Days,
    needsAttention,
  };
}

module.exports = {
  getUseCases,
  getDomains,
  getUseCaseById,
  createUseCase,
  updateUseCase,
  deleteUseCase,
  getDashboardSummary,
};
