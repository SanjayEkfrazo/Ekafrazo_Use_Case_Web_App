import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AdminRoute() {
  const { isAdmin, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/use-cases" replace />;
}

export default AdminRoute;
