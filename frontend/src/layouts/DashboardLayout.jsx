import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import "./DashboardLayout.css";
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="dashboard-root">
      {
    /* Mobile Backdrop */
  }
      {sidebarOpen && <div
    className="sidebar-backdrop lg:hidden"
    onClick={() => setSidebarOpen(false)}
  />}

      {
    /* Persistent / Responsive Sidebar */
  }
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {
    /* Main Content Area */
  }
      <div className="dashboard-main-area">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>;
};
export {
  DashboardLayout
};
