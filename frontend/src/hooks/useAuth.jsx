import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentRole, unlockAdmin as unlockAdminRequest, logoutAdmin as logoutAdminRequest } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState("public");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [rememberedPasscode, setRememberedPasscode] = useState("");

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
    await unlockAdminRequest(normalizedPasscode);
    setRememberedPasscode(normalizedPasscode);
    setRole("admin");
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
