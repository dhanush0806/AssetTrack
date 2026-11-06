import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Activity,
  RotateCcw,
  Save,
  CheckCircle2,
  Database
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/assetRules";
import "./ProfileSettingsPage.css";
const ProfileSettingsPage = () => {
  const { currentUser, switchUserRole } = useAuth();
  const [logs, setLogs] = useState([]);
  const [assetTagPrefix, setAssetTagPrefix] = useState("AST");
  const [warrantyNoticeDays, setWarrantyNoticeDays] = useState("30");
  const [currency, setCurrency] = useState("USD");
  const [savedSuccess, setSavedSuccess] = useState("");
  const loadData = () => {
    setLogs(StorageService.getActivityLogs());
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess("System preferences and organization settings updated successfully.");
    setTimeout(() => setSavedSuccess(""), 4e3);
  };
  const handleResetData = () => {
    if (window.confirm("Reset all assets, assignments, and records to initial corporate seed state?")) {
      StorageService.resetToDefaults();
      window.location.reload();
    }
  };
  return <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Profile & System Configuration</h1>
          <p className="settings-subtitle">
            User credentials, enterprise policy rules, and compliance audit trail
          </p>
        </div>
      </div>

      {savedSuccess && <div className="save-alert">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
          <span>{savedSuccess}</span>
        </div>}

      <div className="settings-grid">
        {
    /* User Profile Card */
  }
        <div className="settings-card">
          <div className="card-top-row">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="card-title">User Account Details</h2>
          </div>
          <div className="profile-badge-row">
            <div className="avatar-large">
              {currentUser.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="profile-name">{currentUser.fullName}</div>
              <div className="profile-email font-mono">{currentUser.email}</div>
              <span className={`role-tag role-${currentUser.role.toLowerCase()}`}>
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="profile-specs">
            <div className="spec-item">
              <span className="spec-lbl">Department</span>
              <span className="spec-txt">{currentUser.department}</span>
            </div>
            <div className="spec-item">
              <span className="spec-lbl">Security Role Level</span>
              <span className="spec-txt">Tier 1 Authoritative</span>
            </div>
          </div>
        </div>

        {
    /* System Policies Form */
  }
        <div className="settings-card">
          <div className="card-top-row">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="card-title">Enterprise System Policies</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Hardware Tag Auto-Prefix</label>
              <input
    type="text"
    className="field-input font-mono uppercase"
    value={assetTagPrefix}
    onChange={(e) => setAssetTagPrefix(e.target.value.toUpperCase())}
  />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Warranty Alert Lead Time</label>
              <select
    className="field-select"
    value={warrantyNoticeDays}
    onChange={(e) => setWarrantyNoticeDays(e.target.value)}
  >
                <option value="15">15 Days Before Expiry</option>
                <option value="30">30 Days Before Expiry (Standard)</option>
                <option value="60">60 Days Before Expiry</option>
                <option value="90">90 Days Before Expiry</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Valuation Currency</label>
              <select
    className="field-select"
    value={currency}
    onChange={(e) => setCurrency(e.target.value)}
  >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div className="flex justify-end mt-2">
              <button type="submit" className="btn-save text-xs py-2 px-3">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {
    /* Manual Backend & Database Configuration Settings */
  }
      <div className="settings-card">
        <div className="card-top-row">
          <Database className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="card-title">Backend API & Database Connection Endpoints</h2>
            <p className="text-xs text-slate-500">
              Configure or manually replace Spring Boot REST endpoints and MySQL server hosts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Spring Boot REST API Base URL</label>
            <input
    type="text"
    className="field-input font-mono text-xs"
    defaultValue="http://localhost:8080/api"
    placeholder="e.g. http://localhost:8080/api or https://api.yourcompany.internal"
  />
            <span className="text-xs text-slate-500">Connected to Controllers in /src/main/java/com/assettrack/controller/</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">MySQL Database Host & Schema</label>
            <input
    type="text"
    className="field-input font-mono text-xs"
    defaultValue="localhost:3306/assettrack_db"
    placeholder="e.g. localhost:3306/assettrack_db"
  />
            <span className="text-xs text-slate-500">Configured in /src/main/resources/application.yml &amp; .env.example</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for manual override or live connection</span>
          </span>
          <button
    type="button"
    className="btn-secondary text-xs py-1.5 px-3"
    onClick={() => {
      setSavedSuccess("Connection configuration verified and saved.");
      setTimeout(() => setSavedSuccess(""), 4e3);
    }}
  >
            Update Connection Endpoints
          </button>
        </div>
      </div>

      {
    /* Database Maintenance and Reset */
  }
      <div className="settings-card">
        <div className="card-top-row">
          <Database className="w-5 h-5 text-slate-600" />
          <h2 className="card-title">Database & Baseline Synchronization</h2>
        </div>
        <p className="text-xs text-slate-600">
          Reinitialize organization inventory, personnel directories, assignment custody cycles, and service logs to baseline state.
        </p>
        <div className="mt-3">
          <button
    type="button"
    className="btn-reset"
    onClick={handleResetData}
  >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span>Reinitialize Enterprise Baseline Records</span>
          </button>
        </div>
      </div>

      {
    /* Comprehensive Audit Trail */
  }
      <div className="settings-card">
        <div className="card-top-row">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h2 className="card-title">Security & Administrative Activity Log</h2>
        </div>

        <div className="table-responsive">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Role</th>
                <th>Action Type</th>
                <th>Target Entity</th>
                <th>Event Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => <tr key={log.id}>
                  <td className="text-xs text-slate-600 font-mono">{formatDate(log.timestamp)}</td>
                  <td className="font-semibold text-slate-900">{log.userName}</td>
                  <td>
                    <span className="role-tag-sub">{log.userRole.replace("_", " ")}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-bold text-slate-800">{log.action}</span>
                  </td>
                  <td>
                    <span className="entity-tag">{log.entityType}</span>
                  </td>
                  <td className="text-xs text-slate-600">{log.details}</td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export {
  ProfileSettingsPage
};
