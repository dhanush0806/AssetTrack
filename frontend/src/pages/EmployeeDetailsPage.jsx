import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  RotateCcw,
  Boxes,
  History
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { StatusBadge } from "../components/StatusBadge";
import { BarcodeBadge } from "../components/BarcodeBadge";
import { formatDate, formatCurrency } from "../utils/assetRules";
import { useAuth } from "../context/AuthContext";
import "./EmployeeDetailsPage.css";
const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [data, setData] = useState(null);
  const loadData = () => {
    if (!id) return;
    const res = StorageService.getEmployeeById(id);
    if (!res) {
      navigate("/employees");
      return;
    }
    setData(res);
  };
  useEffect(() => {
    loadData();
  }, [id]);
  if (!data) return null;
  const { employee, assets, history } = data;
  const activeAssignments = history.filter((h) => h.status === "ACTIVE");
  const pastAssignments = history.filter((h) => h.status === "RETURNED");
  return <div className="employee-details-page">
      {
    /* Top Banner */
  }
      <div className="emp-details-header">
        <div>
          <button type="button" className="back-link" onClick={() => navigate("/employees")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Employee Directory</span>
          </button>
          <div className="flex items-center gap-3 mt-1">
            <div className="avatar-large">
              {employee.firstName[0]}
              {employee.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="emp-full-name">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="emp-badge-code font-mono">{employee.employeeCode}</span>
              </div>
              <div className="emp-meta-row">
                <span className="font-medium text-slate-700">{employee.jobTitle}</span>
                <span className="meta-sep">•</span>
                <span className="text-slate-500">{employee.department}</span>
                <span className="meta-sep">•</span>
                <span className="text-emerald-700 font-semibold text-xs">Active Personnel</span>
              </div>
            </div>
          </div>
        </div>

        {isManager && <div className="emp-header-actions">
            <button
    type="button"
    className="btn-primary"
    onClick={() => navigate(`/assign?employeeId=${employee.id}`)}
  >
              <UserCheck className="w-4 h-4 mr-1.5" />
              <span>Assign Asset</span>
            </button>
          </div>}
      </div>

      {
    /* Information Cards Row */
  }
      <div className="emp-info-grid">
        <div className="info-card">
          <span className="info-card-label">Corporate Email</span>
          <div className="info-card-val flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{employee.email}</span>
          </div>
        </div>

        <div className="info-card">
          <span className="info-card-label">Phone Contact</span>
          <div className="info-card-val flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{employee.phone || "Not recorded"}</span>
          </div>
        </div>

        <div className="info-card">
          <span className="info-card-label">Joined Organization</span>
          <div className="info-card-val flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{formatDate(employee.joinedDate)}</span>
          </div>
        </div>

        <div className="info-card">
          <span className="info-card-label">Current Equipment In Custody</span>
          <div className="info-card-val font-bold text-slate-900">
            {assets.length} items ({formatCurrency(assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0))})
          </div>
        </div>
      </div>

      {
    /* Active Assets Table */
  }
      <div className="emp-section-panel">
        <div className="section-panel-header">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <h2 className="section-panel-title">Active Assets in Custody ({assets.length})</h2>
          </div>
          <span className="text-xs text-slate-500">Currently issued to this employee</span>
        </div>

        <div className="table-responsive">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Manufacturer & Model</th>
                <th>Assigned Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No active equipment currently assigned to {employee.firstName}.
                  </td>
                </tr> : assets.map((asset) => {
    const asg = activeAssignments.find((a) => a.assetId === asset.id);
    return <tr key={asset.id}>
                      <td>
                        <BarcodeBadge assetTag={asset.assetTag} size="sm" />
                      </td>
                      <td>
                        <span
      className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600"
      onClick={() => navigate(`/assets/${asset.id}`)}
    >
                          {asset.name}
                        </span>
                      </td>
                      <td>
                        <span className="category-pill">{asset.categoryName}</span>
                      </td>
                      <td className="text-slate-600">
                        {asset.brand} • {asset.model}
                      </td>
                      <td className="text-slate-700 text-xs font-mono">
                        {asg ? formatDate(asg.assignedDate) : "\u2014"}
                      </td>
                      <td>
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
      type="button"
      className="btn-secondary text-xs py-1 px-2"
      onClick={() => navigate(`/assets/${asset.id}`)}
    >
                            Details
                          </button>
                          {isManager && <button
      type="button"
      className="btn-secondary text-xs py-1 px-2 text-rose-700 hover:bg-rose-50 border-rose-200"
      onClick={() => navigate(`/returns?assetId=${asset.id}`)}
    >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              <span>Return</span>
                            </button>}
                        </div>
                      </td>
                    </tr>;
  })}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Assignment History */
  }
      <div className="emp-section-panel">
        <div className="section-panel-header">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="section-panel-title">Equipment Assignment History ({history.length})</h2>
          </div>
          <span className="text-xs text-slate-500">Full audit log of active and returned items</span>
        </div>

        <div className="table-responsive">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Equipment</th>
                <th>Issued Date</th>
                <th>Returned Date</th>
                <th>Return Condition</th>
                <th>Condition Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    No historical assignments recorded.
                  </td>
                </tr> : history.map((h) => <tr key={h.id}>
                    <td>
                      <span className="font-mono font-bold text-xs text-slate-800">{h.assetTag}</span>
                    </td>
                    <td>
                      <span
    className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600"
    onClick={() => navigate(`/assets/${h.assetId}`)}
  >
                        {h.assetName}
                      </span>
                    </td>
                    <td className="text-slate-700 text-xs">{formatDate(h.assignedDate)}</td>
                    <td className="text-slate-700 text-xs">
                      {h.returnedDate ? formatDate(h.returnedDate) : <span className="text-blue-600 font-semibold">Active</span>}
                    </td>
                    <td>{h.returnCondition ? <span className="condition-tag">{h.returnCondition}</span> : "\u2014"}</td>
                    <td className="text-xs text-slate-500 max-w-xs">{h.returnNotes || "\u2014"}</td>
                    <td>
                      <StatusBadge status={h.status} />
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export {
  EmployeeDetailsPage
};
