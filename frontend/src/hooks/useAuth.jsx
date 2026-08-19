import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentRole, unlockAdmin as unlockAdminRequest, logoutAdmin as logoutAdminRequest } from "../services/authService";

const AuthContext = createContext(null);
const REMEMBERED_PASSCODE_KEY = "auth:remembered-passcode";
const REMEMBERED_PASSCODE_VERIFIED_KEY = "auth:remembered-passcode:verified";

function getSessionRememberedPasscode() {
  try {
    const isVerified = sessionStorage.getItem(REMEMBERED_PASSCODE_VERIFIED_KEY) === "1";
    if (!isVerified) {
      sessionStorage.removeItem(REMEMBERED_PASSCODE_KEY);
      return "";
    }

    const remembered = String(sessionStorage.getItem(REMEMBERED_PASSCODE_KEY) || "").trim();
    if (!remembered) {
      sessionStorage.removeItem(REMEMBERED_PASSCODE_KEY);
      sessionStorage.removeItem(REMEMBERED_PASSCODE_VERIFIED_KEY);
      return "";
    }

    return remembered;
  } catch (_error) {
    return "";
  }
}

function setSessionRememberedPasscode(value) {
  try {
    if (!value) {
      sessionStorage.removeItem(REMEMBERED_PASSCODE_KEY);
      sessionStorage.removeItem(REMEMBERED_PASSCODE_VERIFIED_KEY);
      return;
    }

    sessionStorage.setItem(REMEMBERED_PASSCODE_KEY, value);
    sessionStorage.setItem(REMEMBERED_PASSCODE_VERIFIED_KEY, "1");
  } catch (_error) {
    // Ignore storage write errors and keep auth flow functional.
  }
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState("public");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [rememberedPasscode, setRememberedPasscode] = useState(() => getSessionRememberedPasscode());

  const refreshRole = useCallback(async () => {
    try {
      const response = await fetchCurrentRole();
      const nextRole = response?.data?.role === "admin" ? "admin" : "public";
      setRole(nextRole);
      return nextRole;
    } catch (error) {
      setRole("public");
      return "public";
    }
  }, []);

  useEffect(() => {
    async function bootstrapAuth() {
      await refreshRole();
      setIsAuthLoading(false);
    }

    bootstrapAuth();
  }, [refreshRole]);

  useEffect(() => {
    function handleRoleStale() {
      refreshRole();
    }

    window.addEventListener("auth:role-stale", handleRoleStale);
    return () => {
      window.removeEventListener("auth:role-stale", handleRoleStale);
    };
  }, [refreshRole]);

  const unlockAdmin = useCallback(async (passcode) => {
    const normalizedPasscode = String(passcode || "").trim();
    try {
      await unlockAdminRequest(normalizedPasscode);
      setRememberedPasscode(normalizedPasscode);
      setSessionRememberedPasscode(normalizedPasscode);
      setRole("admin");
    } catch (error) {
      // Keep autofill trustworthy by clearing stale/invalid remembered values.
      setRememberedPasscode("");
      setSessionRememberedPasscode("");
      throw error;
    }
  }, []);

  const lockAdmin = useCallback(async () => {
    await logoutAdminRequest();
    setRole("public");
  }, []);

  const value = useMemo(
    () => ({
      role,
      isAdmin: role === "admin",
      isAuthLoading,
      rememberedPasscode,
      refreshRole,
      unlockAdmin,
      lockAdmin,
    }),
    [role, isAuthLoading, rememberedPasscode, refreshRole, unlockAdmin, lockAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
