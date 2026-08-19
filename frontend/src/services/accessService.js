import { api } from "./api";

export function signupAccessProfile(data) {
  return api.post("/access/signup", {
    fullName: String(data?.fullName || "").trim(),
    workEmail: String(data?.workEmail || "").trim(),
    organization: String(data?.organization || "").trim(),
    purpose: String(data?.purpose || "").trim(),
    phone: String(data?.phone || "").trim(),
    department: String(data?.department || "").trim(),
    projectTimeline: String(data?.projectTimeline || "").trim(),
    notes: String(data?.notes || "").trim(),
  });
}

export function signinAccessProfile(data) {
  return api.post("/access/signin", {
    fullName: String(data?.fullName || "").trim(),
    workEmail: String(data?.workEmail || "").trim(),
  });
}

export function identifyAccessProfile(data) {
  return api.post("/access/identify", {
    workEmail: String(data?.workEmail || "").trim(),
  });
}

export function fetchAccessSession() {
  return api.get("/access/session");
}

export function fetchAccessUsers(limit = 200) {
  return api.get(`/access/users?limit=${encodeURIComponent(String(limit))}`);
}

export function fetchAccessSigninLogs(limit = 300) {
  return api.get(`/access/signin-logs?limit=${encodeURIComponent(String(limit))}`);
}
