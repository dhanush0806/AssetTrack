import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { Modal } from "../components/Modal";
import { formatDate } from "../utils/assetRules";
import { useAuth } from "../context/AuthContext";
import "./UserManagementPage.css";
const UserManagementPage = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ASSET_MANAGER");
  const [department, setDepartment] = useState("IT Operations");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const loadData = () => {
    setUsers(StorageService.getUsers());
  };
  useEffect(() => {
    loadData();
  }, []);
  const openAddModal = () => {
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setRole("ASSET_MANAGER");
    setDepartment("IT Operations");
    setActive(true);
    setError("");
    setShowModal(true);
  };
  const openEditModal = (u) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setRole(u.role);
    setDepartment(u.department);
    setActive(u.active);
    setError("");
    setShowModal(true);
  };
  const handleSave = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    try {
      StorageService.saveUser({
        ...editingUser ? { id: editingUser.id } : {},
        fullName,
        email,
        role,
        department,
        active
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to save user");
    }
  };
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });
  return <div className="users-page">
      <div className="users-header">
        <div>
          <h1 className="users-title">User & Role Management</h1>
          <p className="users-subtitle">
            Administer system access privileges, assign RBAC roles, and manage authentication accounts
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add System User</span>
        </button>
      </div>

      {
    /* Role explanation bar */
  }
      <div className="rbac-info-bar">
        <div className="rbac-pill">
          <span className="font-bold text-rose-700">Administrator:</span> Full control over system settings, user roles, asset classifications, and audit logs.
        </div>
        <div className="rbac-pill">
          <span className="font-bold text-indigo-700">Asset Manager:</span> Registers equipment, assigns assets, records returns, and schedules maintenance tickets.
        </div>
        <div className="rbac-pill">
          <span className="font-bold text-emerald-700">Employee:</span> Views issued custody equipment and submits service return requests.
        </div>
      </div>

      {
    /* Search */
  }
      <div className="search-box-row bg-white p-3 rounded-lg border border-slate-200">
        <div className="search-field flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
    type="text"
    placeholder="Search users by name, email, department, or role..."
    className="search-input"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
        </div>
      </div>

      {
    /* Users Table */
  }
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User Account</th>
              <th>Department</th>
              <th>Assigned Role</th>
              <th>Account Status</th>
              <th>Last Active</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar-circle">
                      {u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="text-slate-700 font-medium">{u.department}</td>
                <td>
                  <span className={`user-role-badge role-${u.role.toLowerCase()}`}>
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td>
                  {u.active ? <span className="active-status-badge">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      <span>Active</span>
                    </span> : <span className="inactive-status-badge">
                      <XCircle className="w-3.5 h-3.5 text-slate-400 mr-1" />
                      <span>Suspended</span>
                    </span>}
                </td>
                <td className="text-xs text-slate-500 font-mono">
                  {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Recently"}
                </td>
                <td className="text-right">
                  <button
    type="button"
    className="action-icon-btn inline-flex"
    onClick={() => openEditModal(u)}
    title="Edit user privileges"
  >
                    <Edit className="w-4 h-4 text-slate-500 hover:text-slate-900" />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      <Modal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    title={editingUser ? `Edit User: ${editingUser.fullName}` : "Create System User"}
  >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Full Name *</label>
            <input
    type="text"
    required
    className="field-input"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
  />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Corporate Email *</label>
            <input
    type="email"
    required
    className="field-input"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Assigned System Role *</label>
              <select
    className="field-select"
    value={role}
    onChange={(e) => setRole(e.target.value)}
  >
                <option value="ADMIN">Administrator (Full Access)</option>
                <option value="ASSET_MANAGER">Asset Manager (Operations)</option>
                <option value="EMPLOYEE">Employee (Personal Custody)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Department</label>
              <input
    type="text"
    className="field-input"
    value={department}
    onChange={(e) => setDepartment(e.target.value)}
  />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
            <input
    type="checkbox"
    id="active-check"
    className="w-4 h-4 text-blue-600 rounded"
    checked={active}
    onChange={(e) => setActive(e.target.checked)}
  />
            <label htmlFor="active-check" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Account Active & Authorized to Sign In
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <button
    type="button"
    className="btn-cancel"
    onClick={() => setShowModal(false)}
  >
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {editingUser ? "Save Changes" : "Create User Account"}
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  UserManagementPage
};
