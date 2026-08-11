// Main layout shared across all pages
// Renders the sidebar on the left and the page content on the right
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">{children}</div>
    </div>
  );
}

export default MainLayout;
