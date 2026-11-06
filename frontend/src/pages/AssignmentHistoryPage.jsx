import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Search,
  FileDown,
  RotateCcw,
  UserCheck
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate } from "../utils/assetRules";
import { exportToCsv } from "../utils/exportToCsv";
import "./AssignmentHistoryPage.css";
const AssignmentHistoryPage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  useEffect(() => {
    setAssignments(StorageService.getAssignments());
  }, []);
  const departments = Array.from(new Set(assignments.map((a) => a.department))).filter(Boolean);
  const filtered = assignments.filter((asg) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = asg.assetName.toLowerCase().includes(q) || asg.assetTag.toLowerCase().includes(q) || asg.employeeName.toLowerCase().includes(q) || asg.assignedByName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || asg.status === statusFilter;
    const matchesDept = departmentFilter === "ALL" || asg.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });
  const handleExportCsv = () => {
    exportToCsv(
      "assettrack_assignment_history",
      filtered.map((a) => ({
        "Asset Tag": a.assetTag,
        "Asset Name": a.assetName,
        "Employee Name": a.employeeName,
        "Employee Email": a.employeeEmail,
        Department: a.department,
        "Issued By": a.assignedByName,
        "Issued Date": a.assignedDate,
        "Expected Return": a.expectedReturnDate || "N/A",
        "Returned Date": a.returnedDate || "Active",
        "Return Condition": a.returnCondition || "N/A",
        "Return Notes": a.returnNotes || "None",
        Status: a.status
      }))
    );
  };
  return <div className="history-page">
      <div className="history-header">
        <div>
          <h1 className="history-title">Assignment & Custody Audit Trail</h1>
          <p className="history-subtitle">
            Immutable historical record of every equipment checkout, return, and condition report
          </p>
        </div>
        <div className="history-actions">
          <button type="button" className="btn-secondary" onClick={handleExportCsv}>
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Export History (CSV)</span>
          </button>
          <button
    type="button"
    className="btn-primary"
    onClick={() => navigate("/assign")}
  >
            <UserCheck className="w-4 h-4 mr-1.5" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {
    /* Filter and Search Panel */
  }
      <div className="history-filter-panel">
        <div className="search-field flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
    type="text"
    placeholder="Search by asset name, tag, employee, or issuer..."
    className="search-input"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
        </div>

        <div className="filter-item">
          <select
    className="filter-select"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
            <option value="ALL">All Custody States</option>
            <option value="ACTIVE">Currently Active</option>
            <option value="RETURNED">Returned & Inspected</option>
          </select>
        </div>

        <div className="filter-item">
          <select
    className="filter-select"
    value={departmentFilter}
    onChange={(e) => setDepartmentFilter(e.target.value)}
  >
            <option value="ALL">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>
                {d}
              </option>)}
          </select>
        </div>
      </div>

      {
    /* History Table */
  }
      <div className="table-container">
        <table className="history-full-table">
          <thead>
            <tr>
              <th>Asset Identifier</th>
              <th>Employee (Custody)</th>
              <th>Department</th>
              <th>Issued By & Date</th>
              <th>Return Date & Notes</th>
              <th>Condition</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr>
                <td colSpan={8} className="empty-state-cell">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="font-semibold text-slate-700">No assignment records found</div>
                  <p className="text-xs text-slate-500">Try modifying your filter parameters</p>
                </td>
              </tr> : filtered.map((asg) => <tr key={asg.id} className="history-row">
                  <td>
                    <div
    className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600"
    onClick={() => navigate(`/assets/${asg.assetId}`)}
  >
                      {asg.assetName}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-600">{asg.assetTag}</span>
                  </td>
                  <td>
                    <div
    className="font-medium text-slate-900 cursor-pointer hover:text-blue-600"
    onClick={() => navigate(`/employees/${asg.employeeId}`)}
  >
                      {asg.employeeName}
                    </div>
                    <div className="text-xs text-slate-500">{asg.employeeEmail}</div>
                  </td>
                  <td>
                    <span className="dept-badge">{asg.department}</span>
                  </td>
                  <td>
                    <div className="text-xs text-slate-800 font-medium">{asg.assignedByName}</div>
                    <div className="text-xs text-slate-500 font-mono">{formatDate(asg.assignedDate)}</div>
                  </td>
                  <td>
                    {asg.returnedDate ? <div>
                        <span className="text-xs font-mono font-medium text-slate-800">
                          {formatDate(asg.returnedDate)}
                        </span>
                        {asg.returnNotes && <div className="text-xs text-slate-500 max-w-xs mt-0.5 truncate" title={asg.returnNotes}>
                            {asg.returnNotes}
                          </div>}
                      </div> : <div>
                        <span className="text-xs font-semibold text-blue-600">Active Deployment</span>
                        {asg.expectedReturnDate && <div className="text-xs text-slate-400">
                            Due: {formatDate(asg.expectedReturnDate)}
                          </div>}
                      </div>}
                  </td>
                  <td>
                    {asg.returnCondition ? <span className="condition-pill">{asg.returnCondition}</span> : <span className="text-xs text-slate-400 italic">In Use</span>}
                  </td>
                  <td>
                    <StatusBadge status={asg.status} />
                  </td>
                  <td className="text-right">
                    {asg.status === "ACTIVE" ? <button
    type="button"
    className="btn-return-shortcut"
    onClick={() => navigate(`/returns?assetId=${asg.assetId}`)}
  >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        <span>Return</span>
                      </button> : <button
    type="button"
    className="btn-details-link"
    onClick={() => navigate(`/assets/${asg.assetId}`)}
  >
                        Details
                      </button>}
                  </td>
                </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};
export {
  AssignmentHistoryPage
};
