import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  LogOut,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import "./Navbar.css";
const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { currentUser, logout, isManager } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/assets?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "ALERT":
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };
  return <header className="navbar">
      <div className="navbar-left">
        <button
    type="button"
    className="menu-toggle-btn"
    onClick={onToggleSidebar}
    aria-label="Toggle navigation menu"
  >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <form onSubmit={handleSearchSubmit} className="quick-search-form">
          <Search className="search-icon w-4 h-4 text-slate-400" />
          <input
    type="search"
    placeholder="Search by tag, serial #, model, or assignee..."
    className="quick-search-input"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    aria-label="Global asset search"
  />
        </form>
      </div>

      <div className="navbar-right">
        {isManager && <button
    type="button"
    className="action-btn-primary"
    onClick={() => navigate("/assets/new")}
  >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Register Asset</span>
          </button>}

        {
    /* Notification Bell with Badge */
  }
        <div className="notification-wrapper">
          <button
    type="button"
    className="nav-icon-btn"
    onClick={() => setShowNotifications(!showNotifications)}
    aria-label="View notifications and warranty alerts"
  >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span className="dropdown-title">System Alerts & Warranties</span>
                {unreadCount > 0 && <button
    type="button"
    className="mark-read-btn"
    onClick={markAllAsRead}
  >
                    Mark all read
                  </button>}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? <div className="empty-notifications">No active alerts or reminders</div> : notifications.map((notif) => <div
    key={notif.id}
    className={`notification-item ${!notif.isRead ? "unread" : ""}`}
    onClick={() => {
      markAsRead(notif.id);
      if (notif.link) {
        navigate(notif.link);
        setShowNotifications(false);
      }
    }}
  >
                      <div className="notif-icon-box">{getSeverityIcon(notif.severity)}</div>
                      <div className="notif-body">
                        <div className="notif-title-row">
                          <span className="notif-title">{notif.title}</span>
                          <span className="notif-time">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="notif-message">{notif.message}</p>
                      </div>
                    </div>)}
              </div>

              <div className="notification-dropdown-footer">
                <button
    type="button"
    className="view-all-link"
    onClick={() => {
      navigate("/warranties");
      setShowNotifications(false);
    }}
  >
                  <span>Review Warranty Schedule</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>}
        </div>

        {
    /* User profile dropdown / signout */
  }
        <div className="nav-user-chip">
          <span className="nav-user-name hidden sm:inline">{currentUser.fullName}</span>
          <button
    type="button"
    className="logout-btn"
    onClick={() => {
      logout();
      navigate("/login");
    }}
    title="Sign out"
    aria-label="Sign out"
  >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>;
};
export {
  Navbar
};
