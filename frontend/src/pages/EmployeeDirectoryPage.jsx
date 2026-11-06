import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Mail,
  Briefcase,
  ChevronRight,
  Boxes
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { Modal } from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import "./EmployeeDirectoryPage.css";
const EmployeeDirectoryPage = () => {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("Software Engineering");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const loadData = () => {
    setEmployees(StorageService.getEmployees());
  };
  useEffect(() => {
    loadData();
  }, []);
  const departments = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);
  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchesSearch = emp.firstName.toLowerCase().includes(q) || emp.lastName.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q) || emp.employeeCode.toLowerCase().includes(q) || emp.jobTitle.toLowerCase().includes(q);
    const matchesDept = departmentFilter === "ALL" || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });
  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }
    try {
      StorageService.saveEmployee({
        firstName,
        lastName,
        email,
        department: dept,
        jobTitle,
        phone
      });
      setShowAddModal(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setJobTitle("");
      setPhone("");
      loadData();
    } catch (err) {
      setError(err.message || "Failed to save employee profile");
    }
  };
  return <div className="employee-directory-page">
      <div className="emp-header">
        <div>
          <h1 className="emp-title">Employee Directory & Equipment Custody</h1>
          <p className="emp-subtitle">
            Personnel registry and real-time equipment assignment status
          </p>
        </div>
        {isManager && <button type="button" className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Employee</span>
          </button>}
      </div>

      {
    /* Filter and Search */
  }
      <div className="emp-search-panel">
        <div className="search-field">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
    type="text"
    placeholder="Search by employee name, ID code, title, or email..."
    className="search-input"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
        </div>

        <div className="dept-filter-box">
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
    /* Employee Cards Grid */
  }
      <div className="employees-grid">
        {filtered.map((emp) => <div
    key={emp.id}
    className="employee-card"
    onClick={() => navigate(`/employees/${emp.id}`)}
  >
            <div className="emp-card-top">
              <div className="emp-avatar">
                {emp.firstName[0]}
                {emp.lastName[0]}
              </div>
              <div className="emp-identity">
                <h3 className="emp-name">
                  {emp.firstName} {emp.lastName}
                </h3>
                <span className="emp-code font-mono">{emp.employeeCode}</span>
              </div>
            </div>

            <div className="emp-details-body">
              <div className="emp-detail-row">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-800 font-medium">{emp.jobTitle}</span>
              </div>
              <div className="emp-dept-tag">{emp.department}</div>
              <div className="emp-detail-row">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 truncate">{emp.email}</span>
              </div>
            </div>

            <div className="emp-card-footer">
              <div className="emp-assets-count">
                <Boxes className="w-4 h-4 text-blue-600 mr-1" />
                <span className="font-bold text-slate-900">{emp.assignedAssetCount || 0}</span>
                <span className="text-slate-500 ml-1">Assets Assigned</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>)}
      </div>

      <Modal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    title="Register New Employee"
  >
        <form onSubmit={handleCreateEmployee} className="flex flex-col gap-4">
          {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">First Name *</label>
              <input
    type="text"
    required
    className="field-input"
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
  />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Last Name *</label>
              <input
    type="text"
    required
    className="field-input"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
  />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Work Email Address *</label>
            <input
    type="email"
    required
    placeholder="e.g. name@company.internal"
    className="field-input"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Department</label>
              <input
    type="text"
    className="field-input"
    value={dept}
    onChange={(e) => setDept(e.target.value)}
  />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Job Title</label>
              <input
    type="text"
    placeholder="e.g. Systems Engineer"
    className="field-input"
    value={jobTitle}
    onChange={(e) => setJobTitle(e.target.value)}
  />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Direct Phone Number</label>
            <input
    type="text"
    placeholder="+1 (555) 000-0000"
    className="field-input"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
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
              Register Employee Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  EmployeeDirectoryPage
};
