import { api } from "./api";

export function fetchCurrentRole() {
  return api.get("/auth/me");
}

export function unlockAdmin(passcode) {
  return api.post("/auth/unlock", { passcode });
}

export function logoutAdmin() {
  return api.post("/auth/logout", {});
}
