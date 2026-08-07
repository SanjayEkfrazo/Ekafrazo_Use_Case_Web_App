// API service dedicated to use case endpoints
// React components call these functions instead of using fetch directly

import { api } from "./api";

// Fetch use cases with search, sort, and pagination applied
export function fetchUseCases({ search = "", domain = "", sortBy = "updated_at", sortOrder = "desc", page = 1, limit = 8 }) {
  const params = new URLSearchParams({ search, domain, sortBy, sortOrder, page, limit });
  return api.get(`/usecases?${params.toString()}`);
}

// Fetch distinct domains for the list page filter
export function fetchUseCaseDomains() {
  return api.get("/usecases/domains");
}

// Fetch a single use case by id
export function fetchUseCaseById(id) {
  return api.get(`/usecases/${id}`);
}

// Create a new use case
export function createUseCase(data) {
  return api.post("/usecases", data);
}

// Update an existing use case
export function updateUseCase(id, data) {
  return api.put(`/usecases/${id}`, data);
}

// Upload a domain image and get a URL to store on the use case
export function uploadDomainImage(file) {
  const formData = new FormData();
  formData.append("domain_image", file);
  return api.postForm("/usecases/upload-domain-image", formData);
}

// Delete a use case
export function deleteUseCase(id) {
  return api.delete(`/usecases/${id}`);
}

// Fetch dashboard summary data
export function fetchDashboardSummary() {
  return api.get("/usecases/summary");
}
