import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Wrench,
  Plus,
  Search,
  FileDown
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { StatusBadge } from "../components/StatusBadge";
import { Modal } from "../components/Modal";
import { formatDate, formatCurrency } from "../utils/assetRules";
import { exportToCsv } from "../utils/exportToCsv";
import { useAuth } from "../context/AuthContext";
import "./MaintenanceRecordsPage.css";
const MaintenanceRecordsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetAssetId = searchParams.get("assetId");
  const { isManager } = useAuth();
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [assetId, setAssetId] = useState(targetAssetId || "");
  const [issueDesc, setIssueDesc] = useState("");
  const [serviceProvider, setServiceProvider] = useState("Apple Authorized Service");
  const [technician, setTechnician] = useState("");
  const [estCost, setEstCost] = useState(120);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newStatus, setNewStatus] = useState("COMPLETED");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [finalCost, setFinalCost] = useState(0);
  const loadData = () => {
    setRecords(StorageService.getMaintenanceRecords());
    setAssets(StorageService.getAssets().assets);
  };
  useEffect(() => {
    loadData();
    if (targetAssetId) {
      setAssetId(targetAssetId);
      setShowAddModal(true);
    }
  }, [targetAssetId]);
  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!assetId || !issueDesc.trim()) return;
    try {
      StorageService.createMaintenanceRecord({
        assetId,
        issueDescription: issueDesc,
        cost: estCost,
        serviceProvider,
        technicianName: technician
      });
      setShowAddModal(false);
      setIssueDesc("");
      setTechnician("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to create ticket");
    }
  };
  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      StorageService.updateMaintenanceStatus(
        selectedRecord.id,
        newStatus,
        resolutionNotes,
        finalCost
      );
      setSelectedRecord(null);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to update record");
    }
  };
  const openUpdateModal = (rec) => {
    setSelectedRecord(rec);
    setNewStatus(rec.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED");
    setResolutionNotes(rec.resolutionNotes || "");
    setFinalCost(rec.cost);
  };
  const handleExportCsv = () => {
    exportToCsv(
      "assettrack_maintenance_report",
      filtered.map((r) => ({
        "Asset Tag": r.assetTag,
        "Asset Name": r.assetName,
        "Issue Description": r.issueDescription,
        "Reported Date": r.reportedDate,
        "Completed Date": r.completedDate || "Pending",
        "Service Provider": r.serviceProvider,
        Technician: r.technicianName || "Unassigned",
        "Cost (USD)": r.cost,
        Status: r.status,
        "Resolution Notes": r.resolutionNotes || "None"
      }))
    );
  };
  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.assetName.toLowerCase().includes(q) || r.assetTag.toLowerCase().includes(q) || r.issueDescription.toLowerCase().includes(q) || r.serviceProvider.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalMaintenanceCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
  return <div className="maintenance-page">
      <div className="maint-header">
        <div>
          <h1 className="maint-title">Maintenance & Hardware Service Records</h1>
          <p className="maint-subtitle">
            Diagnostic tickets, repair tracking, technician vendor accounts, and cumulative service expenditures
          </p>
        </div>
        <div className="maint-actions">
          <button type="button" className="btn-secondary" onClick={handleExportCsv}>
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </button>
          {isManager && <button type="button" className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Log Service Ticket</span>
            </button>}
        </div>
      </div>

      {
    /* Overview Stat Bar */
  }
      <div className="maint-stat-bar">
        <div className="maint-stat-pill">
          <span className="stat-label">Total Repair Expenditures</span>
          <span className="stat-val font-mono">{formatCurrency(totalMaintenanceCost)}</span>
        </div>
        <div className="maint-stat-pill">
          <span className="stat-label">Active Work Orders</span>
          <span className="stat-val text-amber-600 font-bold">
            {records.filter((r) => r.status === "PENDING" || r.status === "IN_PROGRESS").length} jobs
          </span>
        </div>
        <div className="maint-stat-pill">
          <span className="stat-label">Completed Repairs</span>
          <span className="stat-val text-emerald-600 font-bold">
            {records.filter((r) => r.status === "COMPLETED").length} units
          </span>
        </div>
      </div>

      {
    /* Filter and Search */
  }
      <div className="maint-filter-panel">
        <div className="search-field flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
    type="text"
    placeholder="Search by ticket issue, asset tag, or service provider..."
    className="search-input"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
        </div>

        <div className="filter-item">
          <select
    className="filter-select"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
            <option value="ALL">All Service Statuses</option>
            <option value="PENDING">Pending Assessment</option>
            <option value="IN_PROGRESS">In Progress (At Vendor)</option>
            <option value="COMPLETED">Completed & Verified</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {
    /* Records Table */
  }
      <div className="table-container">
        <table className="maint-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Issue & Diagnosis</th>
              <th>Vendor / Technician</th>
              <th>Reported Date</th>
              <th>Service Cost</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr>
                <td colSpan={7} className="empty-state-cell">
                  <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="font-semibold text-slate-800">No maintenance tickets found</div>
                  <p className="text-xs text-slate-500">Hardware assets are currently operating normally</p>
                </td>
              </tr> : filtered.map((rec) => <tr key={rec.id}>
                  <td>
                    <div
    className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600"
    onClick={() => navigate(`/assets/${rec.assetId}`)}
  >
                      {rec.assetName}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-600">{rec.assetTag}</span>
                  </td>
                  <td className="max-w-md">
                    <p className="text-slate-800 font-medium text-xs line-clamp-2">{rec.issueDescription}</p>
                    {rec.resolutionNotes && <div className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 border border-emerald-100">
                        Resolved: {rec.resolutionNotes}
                      </div>}
                  </td>
                  <td>
                    <div className="text-slate-800 font-medium text-xs">{rec.serviceProvider}</div>
                    {rec.technicianName && <div className="text-xs text-slate-500">Tech: {rec.technicianName}</div>}
                  </td>
                  <td className="text-xs text-slate-700 font-mono">{formatDate(rec.reportedDate)}</td>
                  <td>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(rec.cost)}</span>
                  </td>
                  <td>
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {isManager && rec.status !== "COMPLETED" && rec.status !== "CANCELLED" && <button
    type="button"
    className="btn-status-update"
    onClick={() => openUpdateModal(rec)}
  >
                          Update Status
                        </button>}
                      <button
    type="button"
    className="btn-details-link"
    onClick={() => navigate(`/assets/${rec.assetId}`)}
  >
                        Asset
                      </button>
                    </div>
                  </td>
                </tr>)}
          </tbody>
        </table>
      </div>

      {
    /* Add Maintenance Modal */
  }
      <Modal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    title="Create Hardware Service Ticket"
  >
        <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Target Equipment Asset *</label>
            <select
    required
    className="field-select"
    value={assetId}
    onChange={(e) => setAssetId(e.target.value)}
  >
              <option value="">-- Choose Asset to Service --</option>
              {assets.map((a) => <option key={a.id} value={a.id}>
                  {a.assetTag} - {a.name} ({a.brand} {a.model}) [{a.status}]
                </option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Issue Description / Defect Symptoms *</label>
            <textarea
    rows={3}
    required
    className="field-textarea"
    placeholder="Detail broken components, screen damage, power issues, or preventive maintenance tasks..."
    value={issueDesc}
    onChange={(e) => setIssueDesc(e.target.value)}
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Service Provider / Depot</label>
              <input
    type="text"
    className="field-input"
    value={serviceProvider}
    onChange={(e) => setServiceProvider(e.target.value)}
  />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Technician Contact</label>
              <input
    type="text"
    placeholder="e.g. Kevin Zhao"
    className="field-input"
    value={technician}
    onChange={(e) => setTechnician(e.target.value)}
  />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Estimated Repair Cost ($ USD)</label>
            <input
    type="number"
    min="0"
    step="0.01"
    className="field-input font-mono"
    value={estCost}
    onChange={(e) => setEstCost(parseFloat(e.target.value) || 0)}
  />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <button
    type="button"
    className="btn-cancel"
    onClick={() => setShowAddModal(false)}
  >
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Dispatch Service Ticket
            </button>
          </div>
        </form>
      </Modal>

      {
    /* Update Maintenance Modal */
  }
      <Modal
    isOpen={Boolean(selectedRecord)}
    onClose={() => setSelectedRecord(null)}
    title={selectedRecord ? `Update Ticket: ${selectedRecord.assetTag}` : "Update Ticket"}
  >
        {selectedRecord && <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="font-bold text-slate-900">{selectedRecord.assetName}</div>
              <div className="text-xs text-slate-600 mt-0.5">{selectedRecord.issueDescription}</div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">New Service Status *</label>
              <select
    className="field-select"
    value={newStatus}
    onChange={(e) => setNewStatus(e.target.value)}
  >
                <option value="IN_PROGRESS">In Progress (Under active technician inspection)</option>
                <option value="COMPLETED">Completed (Repairs tested, ready for deployment)</option>
                <option value="CANCELLED">Cancelled (No service required)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Final Invoiced Cost ($ USD)</label>
              <input
    type="number"
    min="0"
    step="0.01"
    className="field-input font-mono"
    value={finalCost}
    onChange={(e) => setFinalCost(parseFloat(e.target.value) || 0)}
  />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Technician Resolution Notes</label>
              <textarea
    rows={3}
    className="field-textarea"
    placeholder="Explain replaced components, firmware updates, or pass criteria..."
    value={resolutionNotes}
    onChange={(e) => setResolutionNotes(e.target.value)}
  />
            </div>

            {newStatus === "COMPLETED" && <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                Notice: Marking this repair as Completed will automatically restore the asset's status to <strong>Available</strong> in the inventory catalog.
              </p>}

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
              <button
    type="button"
    className="btn-cancel"
    onClick={() => setSelectedRecord(null)}
  >
                Cancel
              </button>
              <button type="submit" className="btn-save">
                Save & Update Asset
              </button>
            </div>
          </form>}
      </Modal>
    </div>;
};
export {
  MaintenanceRecordsPage
};
