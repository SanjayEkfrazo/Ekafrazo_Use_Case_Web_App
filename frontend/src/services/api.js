// Base API helper built on top of the Fetch API
// Every service file uses this instead of calling fetch() directly

const BASE_URL = "http://localhost:5000/api";

// Perform a request and return parsed JSON, throwing a friendly error on failure
async function request(path, options = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const defaultHeaders = isFormData ? {} : { "Content-Type": "application/json" };

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    credentials: "include",
    ...options,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body.message || "Something went wrong. Please try again.";
    const error = new Error(message);
    error.errors = body.errors;
    throw error;
  }

  return body;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  postForm: (path, formData) => request(path, { method: "POST", body: formData }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
