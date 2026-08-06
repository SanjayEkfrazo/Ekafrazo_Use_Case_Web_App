import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentRole, unlockAdmin as unlockAdminRequest, logoutAdmin as logoutAdminRequest } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState("public");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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

  const unlockAdmin = useCallback(async (passcode) => {
    await unlockAdminRequest(passcode);
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
      refreshRole,
      unlockAdmin,
      lockAdmin,
    }),
    [role, isAuthLoading, refreshRole, unlockAdmin, lockAdmin]
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
