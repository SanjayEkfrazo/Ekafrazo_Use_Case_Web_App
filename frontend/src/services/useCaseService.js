// API service dedicated to use case endpoints
// React components call these functions instead of using fetch directly

import { api } from "./api";

const USECASE_DETAIL_CACHE_TTL_MS = 30 * 1000;
const useCaseDetailCache = new Map();
const useCaseDetailInFlight = new Map();

function getCachedUseCase(id) {
  const key = String(id || "").trim();
  if (!key) {
    return null;
  }

  const entry = useCaseDetailCache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() - entry.timestamp > USECASE_DETAIL_CACHE_TTL_MS) {
    useCaseDetailCache.delete(key);
    return null;
  }

  return entry.data;
}

function setCachedUseCase(id, data) {
  const key = String(id || "").trim();
  if (!key || !data) {
    return;
  }

  useCaseDetailCache.set(key, {
    timestamp: Date.now(),
    data,
  });
}

function invalidateCachedUseCase(id) {
  const key = String(id || "").trim();
  if (!key) {
    return;
  }
  useCaseDetailCache.delete(key);
  useCaseDetailInFlight.delete(key);
}

// Fetch use cases with search, sort, and pagination applied
export function fetchUseCases({ search = "", domain = "", sortBy = "updated_at", sortOrder = "desc", page = 1, limit = 8 }) {
  const params = new URLSearchParams({ search, domain, sortBy, sortOrder, page, limit });
  return api.get(`/usecases?${params.toString()}`);
}

// Fetch distinct domains for the list page filter
export function fetchUseCaseDomains() {
  return api.get("/usecases/domains");
}

export function fetchDomainMedia({ domain = "", domains = [] } = {}) {
  const params = new URLSearchParams();
  if (String(domain || "").trim()) {
    params.set("domain", String(domain).trim());
  }
  if (Array.isArray(domains) && domains.length > 0) {
    const normalizedDomains = domains
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    if (normalizedDomains.length > 0) {
      params.set("domains", normalizedDomains.join(","));
    }
  }

  const query = params.toString();
  return api.get(`/domain-media${query ? `?${query}` : ""}`);
}

export function uploadDomainMediaImages(domain, files) {
  const formData = new FormData();
  formData.append("domain", domain);
  Array.from(files || []).forEach((file) => {
    formData.append("images", file);
  });
  return api.postForm("/domain-media/upload", formData);
}

export function deleteDomainMediaImage(id) {
  return api.delete(`/domain-media/${id}`);
}

export function replaceDomainMediaImage(id, file) {
  const formData = new FormData();
  formData.append("image", file);
  return api.putForm(`/domain-media/${id}`, formData);
}

export function fetchBrowseDomainMedia({ domain = "", domains = [] } = {}) {
  const params = new URLSearchParams();
  if (String(domain || "").trim()) {
    params.set("domain", String(domain).trim());
  }
  if (Array.isArray(domains) && domains.length > 0) {
    const normalizedDomains = domains
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    if (normalizedDomains.length > 0) {
      params.set("domains", normalizedDomains.join(","));
    }
  }

  const query = params.toString();
  return api.get(`/browse-domain-media${query ? `?${query}` : ""}`);
}

export function uploadBrowseDomainMediaImages(domain, files) {
  const formData = new FormData();
  formData.append("domain", domain);
  Array.from(files || []).forEach((file) => {
    formData.append("images", file);
  });
  return api.postForm("/browse-domain-media/upload", formData);
}

export function deleteBrowseDomainMediaImage(id) {
  return api.delete(`/browse-domain-media/${id}`);
}

export function replaceBrowseDomainMediaImage(id, file) {
  const formData = new FormData();
  formData.append("image", file);
  return api.putForm(`/browse-domain-media/${id}`, formData);
}

// Fetch a single use case by id
export async function fetchUseCaseById(id, { preferCache = true } = {}) {
  const key = String(id || "").trim();
  if (preferCache) {
    const cached = getCachedUseCase(key);
    if (cached) {
      return { data: cached };
    }
  }

  const response = await api.get(`/usecases/${id}`);
  setCachedUseCase(key, response?.data);
  return response;
}

export async function prefetchUseCaseById(id) {
  const key = String(id || "").trim();
  if (!key || getCachedUseCase(key)) {
    return;
  }

  if (useCaseDetailInFlight.has(key)) {
    return useCaseDetailInFlight.get(key);
  }

  const request = api
    .get(`/usecases/${id}`)
    .then((response) => {
      setCachedUseCase(key, response?.data);
    })
    .catch(() => {
      // Prefetch should not surface errors to the UI.
    })
    .finally(() => {
      useCaseDetailInFlight.delete(key);
    });

  useCaseDetailInFlight.set(key, request);
  return request;
}

// Create a new use case
export function createUseCase(data) {
  return api.post("/usecases", data);
}

// Update an existing use case
export async function updateUseCase(id, data) {
  const response = await api.put(`/usecases/${id}`, data);
  setCachedUseCase(id, response?.data);
  return response;
}

// Upload a domain image and get a URL to store on the use case
export function uploadDomainImage(file) {
  const formData = new FormData();
  formData.append("domain_image", file);
  return api.postForm("/usecases/upload-domain-image", formData);
}

// Delete a use case
export async function deleteUseCase(id) {
  const response = await api.delete(`/usecases/${id}`);
  invalidateCachedUseCase(id);
  return response;
}

// Fetch dashboard summary data
export function fetchDashboardSummary() {
  return api.get("/usecases/summary");
}
