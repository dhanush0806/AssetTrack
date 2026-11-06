import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  RotateCcw,
  Search,
  CheckCircle2
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { BarcodeBadge } from "../components/BarcodeBadge";
import { Modal } from "../components/Modal";
import { formatDate } from "../utils/assetRules";
import "./ReturnAssetPage.css";
const ReturnAssetPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get("assetId");
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [returnDate, setReturnDate] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [condition, setCondition] = useState("GOOD");
  const [notes, setNotes] = useState("");
  const [sendToMaintenance, setSendToMaintenance] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const loadData = () => {
    const list = StorageService.getAssignments().filter((a) => a.status === "ACTIVE");
    setActiveAssignments(list);
    if (preselectedAssetId) {
      const target = list.find((a) => a.assetId === preselectedAssetId);
      if (target) {
        openReturnDialog(target);
      }
    }
  };
  useEffect(() => {
    loadData();
  }, [preselectedAssetId]);
  const openReturnDialog = (asg) => {
    setSelectedAssignment(asg);
    setCondition("GOOD");
    setNotes("");
    setSendToMaintenance(false);
    setReturnDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  };
  const handleConditionChange = (cond) => {
    setCondition(cond);
    if (cond === "DAMAGED" || cond === "NEEDS_REPAIR") {
      setSendToMaintenance(true);
    }
  };
  const handleConfirmReturn = (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    try {
      StorageService.returnAsset({
        assetId: selectedAssignment.assetId,
        returnedDate: returnDate,
        returnCondition: condition,
        returnNotes: notes,
        returnToMaintenance: sendToMaintenance
      });
      setSuccessMsg(`Successfully processed return of ${selectedAssignment.assetName} from ${selectedAssignment.employeeName}.`);
      setSelectedAssignment(null);
      loadData();
      setTimeout(() => setSuccessMsg(""), 6e3);
    } catch (err) {
      alert(err.message || "Failed to process return");
    }
  };
  const filtered = activeAssignments.filter((asg) => {
    const q = search.toLowerCase();
    return asg.assetName.toLowerCase().includes(q) || asg.assetTag.toLowerCase().includes(q) || asg.employeeName.toLowerCase().includes(q) || asg.department.toLowerCase().includes(q);
  });
  return <div className="return-asset-page">
      <div className="return-header">
        <div>
          <h1 className="return-title">Process Asset Returns</h1>
          <p className="return-subtitle">
            Inspect returned hardware, record physical condition, and replenish available inventory
          </p>
        </div>
      </div>

      {successMsg && <div className="success-banner">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>}

      {
    /* Search Bar */
  }
      <div className="return-search-box">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
    type="text"
    placeholder="Filter by asset name, tag ID, or assigned employee..."
    className="search-input"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
      </div>

      {
    /* Table of Assets in Custody */
  }
      <div className="table-container">
        <table className="return-table">
          <thead>
            <tr>
              <th>Asset Identifier</th>
              <th>Equipment Name</th>
              <th>Current Employee</th>
              <th>Department</th>
              <th>Checkout Date</th>
              <th>Expected Return</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr>
                <td colSpan={7} className="empty-state-cell">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="font-semibold text-slate-800">No active assets awaiting return</div>
                  <p className="text-xs text-slate-500">All equipment is currently safely stored in inventory</p>
                </td>
              </tr> : filtered.map((asg) => <tr key={asg.id}>
                  <td>
                    <BarcodeBadge assetTag={asg.assetTag} size="sm" />
                  </td>
                  <td>
                    <span
    className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600"
    onClick={() => navigate(`/assets/${asg.assetId}`)}
  >
                      {asg.assetName}
                    </span>
                  </td>
                  <td>
                    <span
    className="font-medium text-slate-800 cursor-pointer hover:text-blue-600"
    onClick={() => navigate(`/employees/${asg.employeeId}`)}
  >
                      {asg.employeeName}
                    </span>
                  </td>
                  <td className="text-slate-600">{asg.department}</td>
                  <td className="text-slate-700 text-xs font-mono">{formatDate(asg.assignedDate)}</td>
                  <td className="text-slate-700 text-xs font-mono">
                    {asg.expectedReturnDate ? formatDate(asg.expectedReturnDate) : "Open Ended"}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
    type="button"
    className="btn-process-return"
    onClick={() => openReturnDialog(asg)}
  >
                        <RotateCcw className="w-4 h-4 mr-1.5" />
                        <span>Record Return</span>
                      </button>
                      <button
    type="button"
    className="btn-process-swap"
    onClick={() => navigate(`/assets/${asg.assetId}`)}
    title="Open asset details to replace or swap equipment"
  >
                        <span>Swap / Replace</span>
                      </button>
                    </div>
                  </td>
                </tr>)}
          </tbody>
        </table>
      </div>

      {
    /* Process Return Modal */
  }
      <Modal
    isOpen={Boolean(selectedAssignment)}
    onClose={() => setSelectedAssignment(null)}
    title={selectedAssignment ? `Return: ${selectedAssignment.assetName}` : "Process Return"}
  >
        {selectedAssignment && <form onSubmit={handleConfirmReturn} className="flex flex-col gap-4">
            <div className="return-meta-card">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{selectedAssignment.assetName}</div>
                  <div className="text-xs font-mono text-slate-500">{selectedAssignment.assetTag}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Issued to</div>
                  <div className="font-semibold text-slate-900">{selectedAssignment.employeeName}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Return Date *</label>
              <input
    type="date"
    required
    className="field-input"
    value={returnDate}
    onChange={(e) => setReturnDate(e.target.value)}
  />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Hardware Physical Condition *</label>
              <select
    className="field-select"
    value={condition}
    onChange={(e) => handleConditionChange(e.target.value)}
  >
                <option value="EXCELLENT">Excellent — Factory condition, zero blemishes</option>
                <option value="GOOD">Good — Normal operational wear, clean</option>
                <option value="FAIR">Fair — Minor scratches/scuffs, fully working</option>
                <option value="DAMAGED">Damaged — Needs physical/screen repair</option>
                <option value="NEEDS_REPAIR">Needs Repair — Internal fault / won't boot</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Condition Inspection Notes</label>
              <textarea
    rows={3}
    className="field-textarea"
    placeholder="Document accessories returned (chargers, cables), serial check, and physical condition..."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
    type="checkbox"
    className="w-4 h-4 text-blue-600 rounded"
    checked={sendToMaintenance}
    onChange={(e) => setSendToMaintenance(e.target.checked)}
  />
                <span className="text-xs font-semibold text-slate-800">
                  Route asset directly into Under Maintenance queue
                </span>
              </label>
              <p className="text-xs text-slate-500 mt-1 pl-6">
                If checked, the asset will be unavailable for checkout until technicians complete inspection.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
              <button
    type="button"
    className="btn-cancel"
    onClick={() => setSelectedAssignment(null)}
  >
                Cancel
              </button>
              <button type="submit" className="btn-save">
                Confirm Return & Update Status
              </button>
            </div>
          </form>}
      </Modal>
    </div>;
};
export {
  ReturnAssetPage
};
