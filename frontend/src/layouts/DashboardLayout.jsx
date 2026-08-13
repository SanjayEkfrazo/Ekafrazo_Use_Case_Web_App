import { Outlet } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { useDashboardData } from "../hooks/useDashboardData";

function DashboardLayout() {
  const { showToast } = useToast();
  const dashboardData = useDashboardData(showToast);

  return (
    <div className="flex h-full min-h-full flex-col overflow-hidden bg-app">
      <div className="panel-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-1.5 md:p-2.5">
        <div className="mx-auto min-h-full w-full max-w-[1700px]">
          <Outlet context={{ dashboardData }} />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
