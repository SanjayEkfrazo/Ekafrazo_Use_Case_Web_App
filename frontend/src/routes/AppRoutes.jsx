// Central place where all page routes are defined
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import UseCaseList from "../pages/UseCaseList";
import UseCaseCreate from "../pages/UseCaseCreate";
import UseCaseEdit from "../pages/UseCaseEdit";
import UseCaseDetails from "../pages/UseCaseDetails";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/use-cases" element={<UseCaseList />} />
      <Route path="/use-cases/new" element={<UseCaseCreate />} />
      <Route path="/use-cases/:id" element={<UseCaseDetails />} />
      <Route path="/use-cases/:id/edit" element={<UseCaseEdit />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
