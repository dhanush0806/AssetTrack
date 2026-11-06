import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  UserCheck,
  RotateCcw,
  Wrench,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  History,
  Archive,
  Trash2
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { StatusBadge } from "../components/StatusBadge";
import { BarcodeBadge } from "../components/BarcodeBadge";
import { Modal } from "../components/Modal";
import {
  formatCurrency,
  formatDate,
  getWarrantyStatus,
  calculateDepreciatedValue
} from "../utils/assetRules";
import { useAuth } from "../context/AuthContext";
import "./AssetDetailsPage.css";
const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, currentUser } = useAuth();
  const [asset, setAsset] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnCondition, setReturnCondition] = useState("GOOD");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnToMaintenance, setReturnToMaintenance] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replacementAssetId, setReplacementAssetId] = useState("");
  const [replaceReason, setReplaceReason] = useState("Hardware Refresh / Upgrade");
  const [oldCondition, setOldCondition] = useState("GOOD");
  const [replaceNotes, setReplaceNotes] = useState("");
  const [availableAssets, setAvailableAssets] = useState([]);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [issueDesc, setIssueDesc] = useState("");
  const [maintCost, setMaintCost] = useState(0);
  const [maintProvider, setMaintProvider] = useState("Bay Area Tech Services");
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retireReason, setRetireReason] = useState("End of Lifecycle / Scheduled Decommission");
  const loadAssetData = () => {
    if (!id) return;
    const item = StorageService.getAssetById(id);
    if (!item) {
      navigate("/assets");
      return;
    }
    setAsset(item);
    const allAssignments = StorageService.getAssignments().filter((a) => a.assetId === item.id);
    setAssignments(allAssignments);
    const allMaint = StorageService.getMaintenanceRecords(item.id);
    setMaintenanceRecords(allMaint);
    const avAssets = StorageService.getAssets().assets.filter((a) => a.status === "AVAILABLE" && a.id !== item.id);
    setAvailableAssets(avAssets);
    if (avAssets.length > 0) {
      setReplacementAssetId(avAssets[0].id);
    }
  };
  useEffect(() => {
    loadAssetData();
  }, [id]);
  if (!asset) return null;
  const warranty = getWarrantyStatus(asset.warrantyExpiryDate);
  const currentValue = calculateDepreciatedValue(asset.purchaseCost, asset.purchaseDate, 36);
  const handleProcessReturn = (e) => {
    e.preventDefault();
    try {
      StorageService.returnAsset({
        assetId: asset.id,
        returnCondition,
        returnNotes,
        returnToMaintenance
      });
      setShowReturnModal(false);
      setReturnNotes("");
      loadAssetData();
    } catch (err) {
      alert(err.message);
    }
  };
  const handleProcessReplace = (e) => {
    e.preventDefault();
    if (!replacementAssetId) {
      alert("Please select an available replacement asset.");
      return;
    }
    try {
      const res = StorageService.replaceAsset({
        oldAssetId: asset.id,
        newAssetId: replacementAssetId,
        reason: replaceReason,
        oldAssetCondition: oldCondition,
        oldAssetNotes: replaceNotes,
        assignedById: currentUser.id,
        assignedByName: currentUser.fullName
      });
      setShowReplaceModal(false);
      navigate(`/assets/${replacementAssetId}`);
    } catch (err) {
      alert(err.message);
    }
  };
  const handleScheduleMaintenance = (e) => {
    e.preventDefault();
    if (!issueDesc.trim()) return;
    try {
      StorageService.createMaintenanceRecord({
        assetId: asset.id,
        issueDescription: issueDesc,
        cost: maintCost,
        serviceProvider: maintProvider
      });
      setShowMaintModal(false);
      setIssueDesc("");
      loadAssetData();
    } catch (err) {
      alert(err.message);
    }
  };
  const handleRetireAsset = (e) => {
    e.preventDefault();
    try {
      StorageService.retireAsset(asset.id, retireReason);
      setShowRetireModal(false);
      loadAssetData();
    } catch (err) {
      alert(err.message);
    }
  };
  const handleDeleteAsset = () => {
    if (asset.status !== "RETIRED") {
      alert("Only retired assets can be permanently deleted. Retire the asset first.");
      return;
    }
    if (window.confirm(`Permanently delete "${asset.name}" (${asset.assetTag}) from all records? This action cannot be undone.`)) {
      try {
        StorageService.deleteAsset(asset.id);
        navigate("/assets");
      } catch (err) {
        alert(err.message);
      }
    }
  };
  return <div className="asset-details-page">
      {
    /* Breadcrumb / Top Bar */
  }
      <div className="details-header">
        <div>
          <button type="button" className="back-link" onClick={() => navigate("/assets")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Inventory</span>
          </button>
          <div className="details-title-row">
            <h1 className="details-title">{asset.name}</h1>
            <StatusBadge status={asset.status} />
          </div>
          <div className="details-meta-row">
            <BarcodeBadge assetTag={asset.assetTag} serialNumber={asset.serialNumber} size="md" />
            <span className="meta-divider">•</span>
            <span className="text-slate-600 font-medium">{asset.categoryName}</span>
            <span className="meta-divider">•</span>
            <span className="text-slate-500">{asset.brand} ({asset.model})</span>
          </div>
        </div>

        {
    /* Action Controls */
  }
        <div className="details-actions">
          {isManager && <>
              {asset.status === "AVAILABLE" && <button
    type="button"
    className="btn-action-emerald"
    onClick={() => navigate(`/assign?assetId=${asset.id}`)}
  >
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  <span>Assign Equipment</span>
                </button>}

              {asset.status === "ASSIGNED" && <>
                  <button
    type="button"
    className="btn-action-blue"
    onClick={() => setShowReturnModal(true)}
  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    <span>Record Return</span>
                  </button>
                  <button
    type="button"
    className="btn-action-indigo"
    onClick={() => setShowReplaceModal(true)}
  >
                    <UserCheck className="w-4 h-4 mr-1.5" />
                    <span>Swap / Replace</span>
                  </button>
                </>}

              <button
    type="button"
    className="btn-action-amber"
    onClick={() => setShowMaintModal(true)}
  >
                <Wrench className="w-4 h-4 mr-1.5" />
                <span>Log Maintenance</span>
              </button>

              <button
    type="button"
    className="btn-action-slate"
    onClick={() => navigate(`/assets/${asset.id}/edit`)}
  >
                <Edit className="w-4 h-4 mr-1.5" />
                <span>Edit Specs</span>
              </button>

              {asset.status !== "RETIRED" && <button
    type="button"
    className="btn-action-rose"
    onClick={() => setShowRetireModal(true)}
  >
                <Archive className="w-4 h-4 mr-1.5" />
                <span>Retire Asset</span>
              </button>}

              {asset.status === "RETIRED" && <button
    type="button"
    className="btn-action-danger"
    onClick={handleDeleteAsset}
  >
                <Trash2 className="w-4 h-4 mr-1.5" />
                <span>Delete Record</span>
              </button>}
            </>}
        </div>
      </div>

      {
    /* Main Grid: Specifications & Financial / Warranty Overview */
  }
      <div className="details-grid-two">
        {
    /* Left: Hardware Details */
  }
        <div className="card-panel">
          <h2 className="card-heading">Asset Specifications</h2>
          <dl className="specs-list">
            <div className="spec-row">
              <dt className="spec-term">Asset Tag ID</dt>
              <dd className="spec-val font-mono font-bold text-slate-900">{asset.assetTag}</dd>
            </div>
            <div className="spec-row">
              <dt className="spec-term">Serial Number</dt>
              <dd className="spec-val font-mono">{asset.serialNumber}</dd>
            </div>
            <div className="spec-row">
              <dt className="spec-term">Manufacturer / Brand</dt>
              <dd className="spec-val">{asset.brand}</dd>
            </div>
            <div className="spec-row">
              <dt className="spec-term">Model Details</dt>
              <dd className="spec-val">{asset.model}</dd>
            </div>
            <div className="spec-row">
              <dt className="spec-term">Current Location</dt>
              <dd className="spec-val flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{asset.location}</span>
              </dd>
            </div>
            <div className="spec-row">
              <dt className="spec-term">Current Assignee</dt>
              <dd className="spec-val">
                {asset.currentAssigneeName ? <span
    className="text-blue-600 font-semibold cursor-pointer hover:underline"
    onClick={() => asset.currentAssigneeId && navigate(`/employees/${asset.currentAssigneeId}`)}
  >
                    {asset.currentAssigneeName}
                  </span> : <span className="text-slate-400 italic">None (In Storage)</span>}
              </dd>
            </div>
            {asset.notes && <div className="spec-row">
                <dt className="spec-term">Admin Notes</dt>
                <dd className="spec-val text-slate-600">{asset.notes}</dd>
              </div>}
          </dl>
        </div>

        {
    /* Right: Financial & Warranty Card */
  }
        <div className="card-panel">
          <h2 className="card-heading">Financial & Warranty Lifecycle</h2>

          <div className="financial-summary-box">
            <div className="fin-metric">
              <span className="fin-label">Original Procurement Cost</span>
              <span className="fin-amount font-mono">{formatCurrency(asset.purchaseCost)}</span>
              <span className="fin-sub">Invoiced {formatDate(asset.purchaseDate)}</span>
            </div>
            <div className="fin-metric">
              <span className="fin-label">Current Estimated Book Value</span>
              <span className="fin-amount font-mono text-emerald-700">{formatCurrency(currentValue)}</span>
              <span className="fin-sub">3-yr straight line depreciation</span>
            </div>
          </div>

          <div className={`warranty-box warranty-box-${warranty.status.toLowerCase()}`}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <div className="warranty-title-text font-bold">
                  Warranty Status: {warranty.label}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Contract Coverage Expiration: <span className="font-semibold">{formatDate(asset.warrantyExpiryDate)}</span>
                </div>
                {warranty.daysRemaining < 30 && <div className="warranty-action-hint">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                    Coverage is expired or expiring soon. Check manufacturer support extension.
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {
    /* Assignment History Section */
  }
      <div className="card-panel mt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="card-heading mb-0">Custody & Assignment History</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {assignments.length} total assignment cycles
          </span>
        </div>

        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Assigned Employee</th>
                <th>Department</th>
                <th>Issued Date</th>
                <th>Returned Date</th>
                <th>Return Condition</th>
                <th>Condition Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    No historical assignments recorded for this asset yet.
                  </td>
                </tr> : assignments.map((asg) => <tr key={asg.id}>
                    <td>
                      <span
    className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600"
    onClick={() => navigate(`/employees/${asg.employeeId}`)}
  >
                        {asg.employeeName}
                      </span>
                    </td>
                    <td className="text-slate-600">{asg.department}</td>
                    <td className="text-slate-700">{formatDate(asg.assignedDate)}</td>
                    <td className="text-slate-700">
                      {asg.returnedDate ? formatDate(asg.returnedDate) : <span className="text-blue-600 font-medium">Currently Active</span>}
                    </td>
                    <td>
                      {asg.returnCondition ? <span className="condition-tag">{asg.returnCondition}</span> : "\u2014"}
                    </td>
                    <td className="text-xs text-slate-500 max-w-xs">{asg.returnNotes || "\u2014"}</td>
                    <td>
                      <StatusBadge status={asg.status} />
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Maintenance History Section */
  }
      <div className="card-panel mt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <h2 className="card-heading mb-0">Maintenance & Repair Log</h2>
          </div>
          {isManager && <button
    type="button"
    className="text-xs font-semibold text-blue-600 hover:underline"
    onClick={() => setShowMaintModal(true)}
  >
              + Add Maintenance Log
            </button>}
        </div>

        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Issue Description</th>
                <th>Reported Date</th>
                <th>Service Provider</th>
                <th>Repair Cost</th>
                <th>Status</th>
                <th>Resolution Notes</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.length === 0 ? <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    No maintenance records on file. Hardware in nominal health.
                  </td>
                </tr> : maintenanceRecords.map((m) => <tr key={m.id}>
                    <td className="font-medium text-slate-900 max-w-sm">{m.issueDescription}</td>
                    <td className="text-slate-700">{formatDate(m.reportedDate)}</td>
                    <td className="text-slate-600">{m.serviceProvider}</td>
                    <td className="font-mono font-semibold text-slate-800">{formatCurrency(m.cost)}</td>
                    <td>
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="text-xs text-slate-600 max-w-xs">{m.resolutionNotes || "In evaluation"}</td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Return Asset Modal */
  }
      <Modal
    isOpen={showReturnModal}
    onClose={() => setShowReturnModal(false)}
    title={`Process Return: ${asset.name}`}
  >
        <form onSubmit={handleProcessReturn} className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Confirming return of equipment from{" "}
            <strong className="text-slate-900">{asset.currentAssigneeName}</strong>.
          </p>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Hardware Physical Condition</label>
            <select
    className="field-select"
    value={returnCondition}
    onChange={(e) => setReturnCondition(e.target.value)}
  >
              <option value="EXCELLENT">Excellent (Like New)</option>
              <option value="GOOD">Good (Normal Wear & Tear)</option>
              <option value="FAIR">Fair (Visible scuffs / functional)</option>
              <option value="DAMAGED">Damaged (Requires maintenance inspection)</option>
              <option value="NEEDS_REPAIR">Needs Repair (Broken parts / diagnostic)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Return Notes / Inspection Feedback</label>
            <textarea
    rows={3}
    className="field-textarea"
    placeholder="e.g. Returned with original charger. Cleaned and factory reset."
    value={returnNotes}
    onChange={(e) => setReturnNotes(e.target.value)}
  />
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
    type="checkbox"
    className="w-4 h-4 text-blue-600 rounded"
    checked={returnToMaintenance}
    onChange={(e) => setReturnToMaintenance(e.target.checked)}
  />
            <span className="text-xs font-medium text-slate-700">
              Immediately route asset into Under Maintenance queue for servicing
            </span>
          </label>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <button
    type="button"
    className="btn-cancel"
    onClick={() => setShowReturnModal(false)}
  >
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Complete Return
            </button>
          </div>
        </form>
      </Modal>

      {
    /* Equipment Replacement / Swap Modal */
  }
      <Modal
    isOpen={showReplaceModal}
    onClose={() => setShowReplaceModal(false)}
    title={`Swap / Replace Equipment: ${asset.name}`}
  >
        <form onSubmit={handleProcessReplace} className="flex flex-col gap-4">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="text-xs text-slate-500 uppercase font-semibold">Currently Assigned Personnel</div>
            <div className="font-bold text-slate-900">{asset.currentAssigneeName}</div>
            <div className="text-xs text-slate-600 mt-1">
              Old Unit: <strong>{asset.name}</strong> ({asset.assetTag})
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Replacement Reason *</label>
            <select
    className="field-select"
    value={replaceReason}
    onChange={(e) => setReplaceReason(e.target.value)}
  >
              <option value="Hardware Refresh / Scheduled Lifecycle Upgrade">Hardware Refresh / Scheduled Lifecycle Upgrade</option>
              <option value="Defective Hardware / Power / Motherboard Issue">Defective Hardware / Power / Motherboard Issue</option>
              <option value="Screen or Physical Damage">Screen or Physical Damage</option>
              <option value="Performance / RAM / Storage Upgrade">Performance / RAM / Storage Upgrade</option>
              <option value="Temporary Loaner Unit Swap">Temporary Loaner Unit Swap</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Physical Condition of Old Unit Being Returned</label>
            <select
    className="field-select"
    value={oldCondition}
    onChange={(e) => setOldCondition(e.target.value)}
  >
              <option value="GOOD">Good (Operational wear, return to available inventory)</option>
              <option value="DAMAGED">Damaged (Requires maintenance repair before reissue)</option>
              <option value="NEEDS_REPAIR">Needs Repair (Diagnostic defect)</option>
              <option value="EXCELLENT">Excellent (Like New)</option>
              <option value="FAIR">Fair (Visible scuffs)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Select Available Replacement Asset *</label>
            {availableAssets.length === 0 ? <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-200">
                No available replacement equipment found in inventory. Register or return assets first.
              </div> : <select
    className="field-select"
    value={replacementAssetId}
    onChange={(e) => setReplacementAssetId(e.target.value)}
  >
                {availableAssets.map((av) => <option key={av.id} value={av.id}>
                    {av.assetTag} — {av.name} ({av.brand} {av.model}) - ${av.purchaseCost}
                  </option>)}
              </select>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Replacement Notes & Custody Acknowledgement</label>
            <textarea
    rows={2}
    className="field-textarea"
    placeholder="e.g. Swapped for project deadline. Data transferred."
    value={replaceNotes}
    onChange={(e) => setReplaceNotes(e.target.value)}
  />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <button
    type="button"
    className="btn-cancel"
    onClick={() => setShowReplaceModal(false)}
  >
              Cancel
            </button>
            <button
    type="submit"
    className="btn-save"
    disabled={availableAssets.length === 0}
  >
              Execute Equipment Swap
            </button>
          </div>
        </form>
      </Modal>

      {
    /* Schedule Maintenance Modal */
  }
      <Modal
    isOpen={showMaintModal}
    onClose={() => setShowMaintModal(false)}
    title={`Log Maintenance Ticket: ${asset.assetTag}`}
  >
        <form onSubmit={handleScheduleMaintenance} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Issue Description *</label>
            <textarea
    rows={3}
    required
    className="field-textarea"
    placeholder="Describe malfunction, diagnostic requirement, or repair needed..."
    value={issueDesc}
    onChange={(e) => setIssueDesc(e.target.value)}
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Service Provider</label>
              <input
    type="text"
    className="field-input"
    value={maintProvider}
    onChange={(e) => setMaintProvider(e.target.value)}
  />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Estimated Cost ($)</label>
              <input
    type="number"
    min="0"
    step="0.01"
    className="field-input font-mono"
    value={maintCost}
    onChange={(e) => setMaintCost(parseFloat(e.target.value) || 0)}
  />
            </div>
          </div>

          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
            Notice: Logging this ticket will set the asset's lifecycle status to <strong>Under Maintenance</strong> until repair completion.
          </p>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <button
    type="button"
    className="btn-cancel"
    onClick={() => setShowMaintModal(false)}
  >
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Create Maintenance Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Retire Asset Modal */}
      <Modal
    isOpen={showRetireModal}
    onClose={() => setShowRetireModal(false)}
    title={`Retire Asset: ${asset.name}`}
  >
        <form onSubmit={handleRetireAsset} className="flex flex-col gap-4">
          <div className="p-3 bg-rose-50 rounded border border-rose-200">
            <p className="text-xs text-rose-700 font-medium">
              Retiring this asset will set its status to <strong>Retired</strong> and remove it from active inventory operations. This action marks the asset as decommissioned.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Decommission Reason *</label>
            <select
    className="field-select"
    value={retireReason}
    onChange={(e) => setRetireReason(e.target.value)}
  >
              <option value="End of Lifecycle / Scheduled Decommission">End of Lifecycle / Scheduled Decommission</option>
              <option value="Hardware Failure / Beyond Economic Repair">Hardware Failure / Beyond Economic Repair</option>
              <option value="Stolen / Lost">Stolen / Lost</option>
              <option value="Donated / Transferred to External Party">Donated / Transferred to External Party</option>
              <option value="Replaced by Newer Equipment">Replaced by Newer Equipment</option>
              <option value="Compliance / Security Decommission">Compliance / Security Decommission</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <button
    type="button"
    className="btn-cancel"
    onClick={() => setShowRetireModal(false)}
  >
              Cancel
            </button>
            <button type="submit" className="btn-save" style={{background: "rgb(225 29 72)", borderColor: "rgb(225 29 72)"}}>
              <Archive className="w-4 h-4 mr-1.5 inline" />
              Confirm Retirement
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  AssetDetailsPage
};
