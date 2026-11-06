import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Bell,
  Clock,
  AlertTriangle,
  FileDown
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { BarcodeBadge } from "../components/BarcodeBadge";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate, getWarrantyStatus } from "../utils/assetRules";
import { exportToCsv } from "../utils/exportToCsv";
import { useNotifications } from "../context/NotificationContext";
import "./WarrantyTrackingPage.css";
const WarrantyTrackingPage = () => {
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();
  const [assets, setAssets] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const loadData = () => {
    const list = StorageService.getAssets().assets;
    setAssets(list);
  };
  useEffect(() => {
    loadData();
  }, []);
  const categorizedAssets = assets.map((a) => ({
    ...a,
    warranty: getWarrantyStatus(a.warrantyExpiryDate)
  }));
  const expiredCount = categorizedAssets.filter((a) => a.warranty.status === "EXPIRED").length;
  const criticalCount = categorizedAssets.filter((a) => a.warranty.status === "EXPIRING_30").length;
  const warningCount = categorizedAssets.filter((a) => a.warranty.status === "EXPIRING_60").length;
  const filtered = categorizedAssets.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(q) || item.assetTag.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.model.toLowerCase().includes(q);
    if (filterPeriod === "ALL") return matchSearch;
    return matchSearch && item.warranty.status === filterPeriod;
  });
  const handleSendReminder = (item) => {
    StorageService.addNotification({
      title: `Warranty Alert: ${item.name}`,
      message: `Warranty for ${item.name} (${item.assetTag}) expires on ${formatDate(item.warrantyExpiryDate)}. Action required.`,
      type: "WARRANTY_EXPIRY",
      severity: item.warranty.status === "EXPIRED" ? "ALERT" : "WARNING",
      link: `/assets/${item.id}`
    });
    refreshNotifications();
    setToastMsg(`Reminder dispatched to notification center for ${item.assetTag}.`);
    setTimeout(() => setToastMsg(""), 4e3);
  };
  const handleExportCsv = () => {
    exportToCsv(
      "assettrack_warranty_schedule",
      filtered.map((a) => ({
        "Asset Tag": a.assetTag,
        "Asset Name": a.name,
        Brand: a.brand,
        Model: a.model,
        "Purchase Cost": a.purchaseCost,
        "Purchase Date": a.purchaseDate,
        "Warranty Expiry": a.warrantyExpiryDate,
        "Warranty Status": a.warranty.status,
        "Days Remaining": a.warranty.daysRemaining,
        "Current Assignee": a.currentAssigneeName || "In Storage",
        Location: a.location
      }))
    );
  };
  return <div className="warranty-page">
      <div className="warranty-header">
        <div>
          <h1 className="warranty-title">Hardware Warranty & Maintenance Expiry Tracking</h1>
          <p className="warranty-subtitle">
            Vendor warranty coverage monitor, support SLA expirations, and proactive renewal alerts
          </p>
        </div>
        <div className="warranty-actions">
          <button type="button" className="btn-secondary" onClick={handleExportCsv}>
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Export Schedule</span>
          </button>
        </div>
      </div>

      {toastMsg && <div className="toast-banner">
          <Bell className="w-4 h-4 text-emerald-600 mr-2" />
          <span>{toastMsg}</span>
        </div>}

      {
    /* Critical Status Cards */
  }
      <div className="warranty-summary-cards">
        <div
    className={`warranty-metric-card card-expired ${filterPeriod === "EXPIRED" ? "card-selected" : ""}`}
    onClick={() => setFilterPeriod(filterPeriod === "EXPIRED" ? "ALL" : "EXPIRED")}
  >
          <div className="flex justify-between items-center">
            <span className="metric-title">Expired Warranties</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="metric-count text-rose-700">{expiredCount}</div>
          <p className="metric-sub">Hardware with zero active manufacturer protection</p>
        </div>

        <div
    className={`warranty-metric-card card-critical ${filterPeriod === "EXPIRING_30" ? "card-selected" : ""}`}
    onClick={() => setFilterPeriod(filterPeriod === "EXPIRING_30" ? "ALL" : "EXPIRING_30")}
  >
          <div className="flex justify-between items-center">
            <span className="metric-title">Expiring in &le; 30 Days</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="metric-count text-amber-700">{criticalCount}</div>
          <p className="metric-sub">Immediate vendor renewal required</p>
        </div>

        <div
    className={`warranty-metric-card card-warning ${filterPeriod === "EXPIRING_60" ? "card-selected" : ""}`}
    onClick={() => setFilterPeriod(filterPeriod === "EXPIRING_60" ? "ALL" : "EXPIRING_60")}
  >
          <div className="flex justify-between items-center">
            <span className="metric-title">Expiring in &le; 60 Days</span>
            <ShieldAlert className="w-5 h-5 text-orange-600" />
          </div>
          <div className="metric-count text-orange-700">{warningCount}</div>
          <p className="metric-sub">Upcoming renewals for IT budgeting</p>
        </div>
      </div>

      {
    /* Search and Period Bar */
  }
      <div className="warranty-filter-bar">
        <div className="search-field flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
    type="text"
    placeholder="Search by asset name, model, tag, or manufacturer..."
    className="search-input"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
        </div>

        <div className="filter-item">
          <select
    className="filter-select"
    value={filterPeriod}
    onChange={(e) => setFilterPeriod(e.target.value)}
  >
            <option value="ALL">All Hardware Coverage</option>
            <option value="EXPIRED">Expired Only</option>
            <option value="EXPIRING_30">Critical (&le; 30 Days)</option>
            <option value="EXPIRING_60">Warning (&le; 60 Days)</option>
            <option value="EXPIRING_90">Upcoming (&le; 90 Days)</option>
          </select>
        </div>
      </div>

      {
    /* Warranty Schedule Table */
  }
      <div className="table-container">
        <table className="warranty-table">
          <thead>
            <tr>
              <th>Asset Identifier</th>
              <th>Hardware Specifications</th>
              <th>Purchase Date</th>
              <th>Warranty Expiration</th>
              <th>Days Remaining</th>
              <th>Coverage Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr>
                <td colSpan={7} className="empty-state-cell">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="font-semibold text-slate-800">No assets in this category</div>
                  <p className="text-xs text-slate-500">All equipment is under valid warranty</p>
                </td>
              </tr> : filtered.map((item) => <tr key={item.id}>
                  <td>
                    <BarcodeBadge assetTag={item.assetTag} size="sm" />
                    <div className="text-xs text-slate-500 font-mono mt-0.5">SN: {item.serialNumber}</div>
                  </td>
                  <td>
                    <div
    className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600"
    onClick={() => navigate(`/assets/${item.id}`)}
  >
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.brand} • {item.model}
                    </div>
                  </td>
                  <td className="text-slate-700 text-xs font-mono">{formatDate(item.purchaseDate)}</td>
                  <td>
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {formatDate(item.warrantyExpiryDate)}
                    </div>
                  </td>
                  <td>
                    {item.warranty.daysRemaining < 0 ? <span className="font-mono text-xs font-bold text-rose-600">
                        Expired {Math.abs(item.warranty.daysRemaining)} days ago
                      </span> : <span className="font-mono text-xs font-bold text-slate-800">
                        {item.warranty.daysRemaining} days left
                      </span>}
                  </td>
                  <td>
                    <StatusBadge status={item.warranty.status} />
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
    type="button"
    className="btn-remind-action"
    title="Dispatch in-app alert reminder"
    onClick={() => handleSendReminder(item)}
  >
                        <Bell className="w-3.5 h-3.5 mr-1" />
                        <span>Send Alert</span>
                      </button>
                      <button
    type="button"
    className="btn-details-link"
    onClick={() => navigate(`/assets/${item.id}`)}
  >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};
export {
  WarrantyTrackingPage
};
