import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  Clock,
  FileDown,
  Plus,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  UserCheck
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDate } from "../utils/assetRules";
import { exportToCsv } from "../utils/exportToCsv";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css";
const DashboardPage = () => {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [metrics, setMetrics] = useState(null);
  useEffect(() => {
    setMetrics(StorageService.getDashboardMetrics());
  }, []);
  if (!metrics) return null;
  const handleExportCsv = () => {
    const { assets } = StorageService.getAssets();
    exportToCsv(
      "assettrack_inventory_summary",
      assets.map((a) => ({
        "Asset Tag": a.assetTag,
        "Serial Number": a.serialNumber,
        Name: a.name,
        Category: a.categoryName,
        Brand: a.brand,
        Model: a.model,
        Status: a.status,
        "Purchase Cost (USD)": a.purchaseCost,
        "Purchase Date": a.purchaseDate,
        "Warranty Expiry": a.warrantyExpiryDate,
        "Current Assignee": a.currentAssigneeName || "None",
        Location: a.location
      }))
    );
  };
  return <div className="dashboard-page">
      {
    /* Top Banner / Actions */
  }
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Asset Dashboard</h1>
          <p className="page-subtitle">
            Lifecycle operations, deployment metrics, and hardware compliance overview
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={handleExportCsv}>
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </button>
          {isManager && <button
    type="button"
    className="btn-primary"
    onClick={() => navigate("/assets/new")}
  >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Register Asset</span>
            </button>}
        </div>
      </div>

      {
    /* Critical Reminders Banner if any warranties or maintenance are pending */
  }
      {(metrics.expiredWarranties > 0 || metrics.expiringWarranties30Days > 0) && <div className="warranty-alert-banner">
          <div className="alert-banner-left">
            <div className="alert-icon-pill">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="alert-banner-title">
                Warranty Attention Required ({metrics.expiredWarranties + metrics.expiringWarranties30Days} Assets)
              </h2>
              <p className="alert-banner-desc">
                {metrics.expiredWarranties} hardware items have expired warranties, and{" "}
                {metrics.expiringWarranties30Days} expire within 30 days. Review coverage to avoid unprotected repair downtime.
              </p>
            </div>
          </div>
          <button
    type="button"
    className="alert-banner-action"
    onClick={() => navigate("/warranties")}
  >
            <span>Review Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>}

      {
    /* Stat Cards Grid */
  }
      <div className="stats-grid">
        <StatCard
    title="Total Registered Assets"
    value={metrics.totalAssets}
    subtitle="Enterprise IT portfolio"
    iconName="Boxes"
    variant="indigo"
    onClick={() => navigate("/assets")}
  />
        <StatCard
    title="Available in Stock"
    value={metrics.availableAssets}
    subtitle="Ready for deployment"
    iconName="CheckCircle"
    variant="emerald"
    onClick={() => navigate("/assets?status=AVAILABLE")}
  />
        <StatCard
    title="Currently Assigned"
    value={metrics.assignedAssets}
    subtitle={`${metrics.activeAssignmentsCount} employees active`}
    iconName="UserCheck"
    variant="blue"
    onClick={() => navigate("/assets?status=ASSIGNED")}
  />
        <StatCard
    title="Under Maintenance"
    value={metrics.maintenanceAssets}
    subtitle={`${metrics.pendingMaintenanceCount} active service jobs`}
    iconName="Clock"
    variant="amber"
    onClick={() => navigate("/maintenance")}
  />
        <StatCard
    title="Total Asset Valuation"
    value={formatCurrency(metrics.totalValuation)}
    subtitle="Procurement cost basis"
    iconName="TrendingUp"
    variant="slate"
  />
      </div>

      {
    /* Quick Action Shortcuts for Asset Operations */
  }
      <div className="quick-actions-bar">
        <span className="quick-actions-label">Common Workflows:</span>
        <button
    type="button"
    className="quick-action-pill"
    onClick={() => navigate("/assign")}
  >
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Assign Equipment</span>
        </button>
        <button
    type="button"
    className="quick-action-pill"
    onClick={() => navigate("/returns")}
  >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Record Asset Return</span>
        </button>
        <button
    type="button"
    className="quick-action-pill"
    onClick={() => navigate("/maintenance")}
  >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Log Service Ticket</span>
        </button>
        <button
    type="button"
    className="quick-action-pill"
    onClick={() => navigate("/categories")}
  >
          <Boxes className="w-3.5 h-3.5 text-indigo-600" />
          <span>Manage Categories</span>
        </button>
      </div>

      {
    /* Main Grid: Status Distribution & Categories Breakdown */
  }
      <div className="dashboard-grid-two">
        {
    /* Status Distribution */
  }
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Asset Fleet Status</h2>
            <button
    type="button"
    className="panel-link"
    onClick={() => navigate("/assets")}
  >
              View Inventory
            </button>
          </div>
          <div className="status-bars-container">
            {metrics.statusBreakdown.map((sb) => <div key={sb.status} className="status-row">
                <div className="status-row-info">
                  <span className="status-row-label">{sb.status}</span>
                  <span className="status-row-count">
                    {sb.count} assets ({sb.percentage}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div
    className={`progress-fill progress-${sb.status.toLowerCase()}`}
    style={{ width: `${Math.max(sb.percentage, 4)}%` }}
  />
                </div>
              </div>)}
          </div>
        </div>

        {
    /* Category Breakdown */
  }
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Asset Portfolio by Category</h2>
            <button
    type="button"
    className="panel-link"
    onClick={() => navigate("/categories")}
  >
              All Categories
            </button>
          </div>
          <div className="category-list">
            {metrics.categoryBreakdown.map((cat) => <div key={cat.categoryName} className="category-item">
                <div className="category-item-main">
                  <span className="category-item-name">{cat.categoryName}</span>
                  <span className="category-item-count">{cat.count} units</span>
                </div>
                <div className="category-item-val">{formatCurrency(cat.value)}</div>
              </div>)}
          </div>
        </div>
      </div>

      {
    /* Second Grid: Recent Assignments & Audit Log */
  }
      <div className="dashboard-grid-two">
        {
    /* Active Assignments */
  }
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Recent Equipment Assignments</h2>
            <button
    type="button"
    className="panel-link"
    onClick={() => navigate("/assignments/history")}
  >
              Full History
            </button>
          </div>
          <div className="table-responsive">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentAssignments.length === 0 ? <tr>
                    <td colSpan={4} className="empty-table-cell">
                      No assignments recorded
                    </td>
                  </tr> : metrics.recentAssignments.map((asg) => <tr key={asg.id}>
                      <td>
                        <div className="font-semibold text-slate-900">{asg.assetName}</div>
                        <div className="text-xs text-slate-500 font-mono">{asg.assetTag}</div>
                      </td>
                      <td>
                        <div className="text-slate-800">{asg.employeeName}</div>
                        <div className="text-xs text-slate-500">{asg.department}</div>
                      </td>
                      <td className="text-xs text-slate-600">{formatDate(asg.assignedDate)}</td>
                      <td>
                        <StatusBadge status={asg.status} />
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {
    /* Activity Audit Trail */
  }
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Administrative Audit Trail</h2>
            <span className="panel-badge">Compliance Log</span>
          </div>
          <div className="activity-timeline">
            {metrics.recentActivity.map((log) => <div key={log.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-user">{log.userName}</span>
                    <span className="timeline-time">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="timeline-details">{log.details}</p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export {
  DashboardPage
};
