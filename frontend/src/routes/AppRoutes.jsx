// Central place where all page routes are defined
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loader from "../components/Loader";
import AdminRoute from "./AdminRoute";

const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const DashboardOverview = lazy(() => import("../pages/DashboardOverview"));
const UseCaseList = lazy(() => import("../pages/UseCaseList"));
const UseCaseCreate = lazy(() => import("../pages/UseCaseCreate"));
const UseCaseEdit = lazy(() => import("../pages/UseCaseEdit"));
const UseCaseDetails = lazy(() => import("../pages/UseCaseDetails"));
const NotFound = lazy(() => import("../pages/NotFound"));

function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6"><Loader rows={6} /></div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/use-cases" replace />} />
        <Route element={<AdminRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="insights" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="activity" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="quality" element={<Navigate to="/dashboard/overview" replace />} />
          </Route>
        </Route>
        <Route path="/use-cases" element={<UseCaseList />} />
        <Route path="/use-cases/:id" element={<UseCaseDetails />} />
        <Route element={<AdminRoute />}>
          <Route path="/use-cases/new" element={<UseCaseCreate />} />
          <Route path="/use-cases/:id/edit" element={<UseCaseEdit />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
