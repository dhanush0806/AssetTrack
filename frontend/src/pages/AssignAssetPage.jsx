import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  UserCheck,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { useAuth } from "../context/AuthContext";
import { canAssignAsset, formatCurrency } from "../utils/assetRules";
import { BarcodeBadge } from "../components/BarcodeBadge";
import { StatusBadge } from "../components/StatusBadge";
import "./AssignAssetPage.css";
const AssignAssetPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const preselectedAssetId = searchParams.get("assetId") || "";
  const preselectedEmployeeId = searchParams.get("employeeId") || "";
  const [availableAssets, setAvailableAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(preselectedAssetId);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(preselectedEmployeeId);
  const [issueDate, setIssueDate] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1e3).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const { assets } = StorageService.getAssets();
    setAllAssets(assets);
    setAvailableAssets(assets.filter((a) => a.status === "AVAILABLE"));
    setEmployees(StorageService.getEmployees());
  }, []);
  const selectedAsset = allAssets.find((a) => a.id === selectedAssetId);
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const availabilityCheck = selectedAsset ? canAssignAsset(selectedAsset) : null;
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!selectedAssetId) {
      setError("Please select an equipment asset to assign.");
      return;
    }
    if (!selectedEmployeeId) {
      setError("Please select a recipient employee from the directory.");
      return;
    }
    if (selectedAsset) {
      const check = canAssignAsset(selectedAsset);
      if (!check.allowed) {
        setError(`Cannot assign asset: ${check.reason}`);
        return;
      }
    }
    try {
      const assignment = StorageService.assignAsset({
        assetId: selectedAssetId,
        employeeId: selectedEmployeeId,
        assignedById: currentUser.id,
        assignedByName: currentUser.fullName,
        expectedReturnDate,
        notes
      });
      navigate(`/assets/${selectedAssetId}`);
    } catch (err) {
      setError(err.message || "Failed to complete assignment.");
    }
  };
  return <div className="assign-asset-page">
      <div className="assign-header">
        <button type="button" className="back-link" onClick={() => navigate("/assets")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Assets</span>
        </button>
        <h1 className="assign-title">Issue Equipment to Employee</h1>
        <p className="assign-subtitle">
          Record custody transfer, set return dates, and ensure equipment availability compliance
        </p>
      </div>

      {error && <div className="error-banner">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>}

      {
    /* Unavailable Warning if selected asset is not AVAILABLE */
  }
      {selectedAsset && availabilityCheck && !availabilityCheck.allowed && <div className="unavailable-warning-card">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900">Equipment is Currently Unavailable</h3>
              <p className="text-xs text-amber-800 mt-1">{availabilityCheck.reason}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-slate-700">Current Status:</span>
                <StatusBadge status={selectedAsset.status} />
              </div>
            </div>
          </div>
        </div>}

      <form onSubmit={handleSubmit} className="assign-form-container">
        {
    /* Step 1: Asset Selection */
  }
        <div className="form-card">
          <div className="form-card-header">
            <div className="step-circle">1</div>
            <div>
              <h2 className="card-title">Select Equipment Asset</h2>
              <p className="card-sub">Choose from available stock or search by asset tag</p>
            </div>
          </div>

          <div className="form-body">
            <div className="flex flex-col gap-1">
              <label htmlFor="assign-asset-select" className="text-xs font-bold text-slate-700 uppercase">
                Asset Selection *
              </label>
              <select
    id="assign-asset-select"
    className="field-select"
    value={selectedAssetId}
    onChange={(e) => setSelectedAssetId(e.target.value)}
    required
  >
                <option value="">-- Select Asset from Inventory --</option>
                <optgroup label="Available in Stock">
                  {availableAssets.map((a) => <option key={a.id} value={a.id}>
                      {a.assetTag} - {a.name} ({a.brand} {a.model}) - {a.location}
                    </option>)}
                </optgroup>
                <optgroup label="Unavailable Assets (Cannot Assign)">
                  {allAssets.filter((a) => a.status !== "AVAILABLE").map((a) => <option key={a.id} value={a.id}>
                        {a.assetTag} - {a.name} [{a.status.replace("_", " ")}]
                      </option>)}
                </optgroup>
              </select>
            </div>

            {selectedAsset && <div className="selected-asset-preview">
                <div className="preview-top">
                  <div>
                    <h3 className="preview-name">{selectedAsset.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <BarcodeBadge assetTag={selectedAsset.assetTag} size="sm" />
                      <span className="text-xs text-slate-500 font-mono">SN: {selectedAsset.serialNumber}</span>
                    </div>
                  </div>
                  <StatusBadge status={selectedAsset.status} />
                </div>
                <div className="preview-meta-grid">
                  <div>
                    <span className="meta-lbl">Category:</span>
                    <span className="meta-val">{selectedAsset.categoryName}</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Storage Location:</span>
                    <span className="meta-val">{selectedAsset.location}</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Purchase Cost:</span>
                    <span className="meta-val font-mono">{formatCurrency(selectedAsset.purchaseCost)}</span>
                  </div>
                </div>
              </div>}
          </div>
        </div>

        {
    /* Step 2: Employee Selection */
  }
        <div className="form-card">
          <div className="form-card-header">
            <div className="step-circle">2</div>
            <div>
              <h2 className="card-title">Select Custody Recipient</h2>
              <p className="card-sub">Identify employee receiving company equipment</p>
            </div>
          </div>

          <div className="form-body">
            <div className="flex flex-col gap-1">
              <label htmlFor="assign-employee-select" className="text-xs font-bold text-slate-700 uppercase">
                Employee Name *
              </label>
              <select
    id="assign-employee-select"
    className="field-select"
    value={selectedEmployeeId}
    onChange={(e) => setSelectedEmployeeId(e.target.value)}
    required
  >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.department} - {emp.jobTitle}
                  </option>)}
              </select>
            </div>

            {selectedEmployee && <div className="selected-emp-preview">
                <div className="flex items-center gap-3">
                  <div className="avatar-circle">
                    {selectedEmployee.firstName[0]}
                    {selectedEmployee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h3>
                    <div className="text-xs text-slate-600">
                      {selectedEmployee.jobTitle} • {selectedEmployee.department} • {selectedEmployee.email}
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>

        {
    /* Step 3: Terms & Dates */
  }
        <div className="form-card">
          <div className="form-card-header">
            <div className="step-circle">3</div>
            <div>
              <h2 className="card-title">Assignment Terms & Dates</h2>
              <p className="card-sub">Specify dispatch timestamp and expected return schedule</p>
            </div>
          </div>

          <div className="form-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="issue-date" className="text-xs font-bold text-slate-700 uppercase">Issue Date *</label>
                <input
    id="issue-date"
    type="date"
    required
    className="field-input"
    value={issueDate}
    onChange={(e) => setIssueDate(e.target.value)}
  />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="expected-return-date" className="text-xs font-bold text-slate-700 uppercase">Expected Return Date</label>
                <input
    id="expected-return-date"
    type="date"
    className="field-input"
    value={expectedReturnDate}
    onChange={(e) => setExpectedReturnDate(e.target.value)}
  />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="assignment-notes" className="text-xs font-bold text-slate-700 uppercase">Assignment Purpose & Policy Notes</label>
              <textarea
    id="assignment-notes"
    rows={2}
    className="field-textarea"
    placeholder="e.g. Standard onboarding hardware package. Employee acknowledged hardware security policy."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
            </div>
          </div>
        </div>

        {
    /* Submit */
  }
        <div className="flex justify-end gap-3 pt-2">
          <button
    type="button"
    className="btn-cancel"
    onClick={() => navigate("/assets")}
  >
            Cancel
          </button>
          <button
    type="submit"
    className="btn-save"
    disabled={Boolean(availabilityCheck && !availabilityCheck.allowed)}
  >
            <UserCheck className="w-4 h-4 mr-2" />
            <span>Confirm Equipment Assignment</span>
          </button>
        </div>
      </form>
    </div>;
};
export {
  AssignAssetPage
};
