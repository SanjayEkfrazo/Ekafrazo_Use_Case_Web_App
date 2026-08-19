// Central place where all page routes are defined
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Loader from "../components/Loader";
import PageTransition from "../components/PageTransition";
import AdminRoute from "./AdminRoute";

const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const DashboardOverview = lazy(() => import("../pages/DashboardOverview"));
const UseCaseList = lazy(() => import("../pages/UseCaseList"));
const UseCaseCreate = lazy(() => import("../pages/UseCaseCreate"));
const UseCaseEdit = lazy(() => import("../pages/UseCaseEdit"));
const UseCaseDetails = lazy(() => import("../pages/UseCaseDetails"));
const DomainMediaManager = lazy(() => import("../pages/DomainMediaManager"));
const BrowseDomainMediaManager = lazy(() => import("../pages/BrowseDomainMediaManager"));
const AccessAudit = lazy(() => import("../pages/AccessAudit"));
const NotFound = lazy(() => import("../pages/NotFound"));

function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="p-4 md:p-6"><Loader rows={6} /></div>}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/use-cases" replace />} />
        <Route element={<AdminRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<PageTransition><DashboardOverview /></PageTransition>} />
            <Route path="insights" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="activity" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="quality" element={<Navigate to="/dashboard/overview" replace />} />
          </Route>
        </Route>
        <Route path="/use-cases" element={<PageTransition><UseCaseList /></PageTransition>} />
        <Route path="/use-cases/:id" element={<PageTransition><UseCaseDetails /></PageTransition>} />
        <Route element={<AdminRoute />}>
          <Route path="/use-cases/new" element={<PageTransition><UseCaseCreate /></PageTransition>} />
          <Route path="/use-cases/:id/edit" element={<PageTransition><UseCaseEdit /></PageTransition>} />
          <Route path="/access-audit" element={<PageTransition><AccessAudit /></PageTransition>} />
          <Route path="/domain-media" element={<PageTransition><DomainMediaManager /></PageTransition>} />
          <Route path="/browse-domain-media" element={<PageTransition><BrowseDomainMediaManager /></PageTransition>} />
        </Route>
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default AppRoutes;
