// Main layout shared across all pages
// Renders the sidebar on the left and the page content on the right
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-app">
      <Sidebar />
      <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export default MainLayout;
