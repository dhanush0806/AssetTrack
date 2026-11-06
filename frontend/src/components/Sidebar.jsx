import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  FolderTree,
  UserCheck,
  History,
  RotateCcw,
  Wrench,
  ShieldAlert,
  Users,
  FileBarChart2,
  UserCog,
  Settings,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";
const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, switchUserRole, isAdmin, isManager } = useAuth();
  const handleLinkClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };
  return <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="brand-text-container">
          <span className="brand-name">AssetTrack</span>
          <span className="brand-tagline">Enterprise Asset Management</span>
        </div>
      </div>

      {
    /* Role Switcher Pill for Testing All Roles */
  }
      <div className="role-switcher-card">
        <div className="role-header">
          <span className="role-caption">Active Role</span>
          <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>
            {currentUser.role.replace("_", " ")}
          </span>
        </div>
        <div className="role-buttons">
          <button
    type="button"
    className={`role-btn ${currentUser.role === "ADMIN" ? "active" : ""}`}
    onClick={() => switchUserRole("ADMIN")}
  >
            Admin
          </button>
          <button
    type="button"
    className={`role-btn ${currentUser.role === "ASSET_MANAGER" ? "active" : ""}`}
    onClick={() => switchUserRole("ASSET_MANAGER")}
  >
            Manager
          </button>
          <button
    type="button"
    className={`role-btn ${currentUser.role === "EMPLOYEE" ? "active" : ""}`}
    onClick={() => switchUserRole("EMPLOYEE")}
  >
            Employee
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-title">Core Operations</div>
        <NavLink
    to="/dashboard"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <LayoutDashboard className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
    to="/assets"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <Boxes className="nav-icon" />
          <span>Asset Inventory</span>
        </NavLink>

        {isManager && <NavLink
    to="/assets/new"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
            <PlusCircle className="nav-icon" />
            <span>Register Asset</span>
          </NavLink>}

        <NavLink
    to="/categories"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <FolderTree className="nav-icon" />
          <span>Categories</span>
        </NavLink>

        <div className="nav-group-title">Lifecycle & Tracking</div>
        {isManager && <NavLink
    to="/assign"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
            <UserCheck className="nav-icon" />
            <span>Assign Equipment</span>
          </NavLink>}

        <NavLink
    to="/returns"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <RotateCcw className="nav-icon" />
          <span>Return Asset</span>
        </NavLink>

        <NavLink
    to="/assignments/history"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <History className="nav-icon" />
          <span>Assignment History</span>
        </NavLink>

        <NavLink
    to="/maintenance"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <Wrench className="nav-icon" />
          <span>Maintenance Records</span>
        </NavLink>

        <NavLink
    to="/warranties"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <ShieldAlert className="nav-icon" />
          <span>Warranty Tracking</span>
        </NavLink>

        <div className="nav-group-title">Organization & Data</div>
        <NavLink
    to="/employees"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <Users className="nav-icon" />
          <span>Employee Directory</span>
        </NavLink>

        <NavLink
    to="/reports"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <FileBarChart2 className="nav-icon" />
          <span>Reports & CSV Export</span>
        </NavLink>

        {isAdmin && <NavLink
    to="/users"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
            <UserCog className="nav-icon" />
            <span>Users & Roles</span>
          </NavLink>}

        <NavLink
    to="/settings"
    className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    onClick={handleLinkClick}
  >
          <Settings className="nav-icon" />
          <span>Profile & Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-strip">
          <div className="avatar-circle">
            {currentUser.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser.fullName}</span>
            <span className="user-dept">{currentUser.department}</span>
          </div>
        </div>
      </div>
    </aside>;
};
export {
  Sidebar
};
