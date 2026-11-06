import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, switchUserRole } = useAuth();
  const [email, setEmail] = useState("manager@assettrack.com");
  const [password, setPassword] = useState("EnterprisePass2026!");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please provide email and password.");
      return;
    }
    const success = login(email);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials.");
    }
  };
  const selectRoleAccount = (role, roleEmail) => {
    setEmail(roleEmail);
    switchUserRole(role);
    navigate("/dashboard");
  };
  return <div className="login-page-root">
      <div className="login-card-container">
        <div className="login-brand-header">
          <div className="login-logo-box">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="login-title">AssetTrack</h1>
          <p className="login-subtitle">Enterprise IT & Equipment Management System</p>
        </div>

        {error && <div className="login-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Work Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon w-4 h-4 text-slate-400" />
              <input
    id="login-email"
    type="email"
    className="form-input"
    placeholder="name@company.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon w-4 h-4 text-slate-400" />
              <input
    id="login-password"
    type="password"
    className="form-input"
    placeholder="••••••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            <span>Sign In to Organization</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="login-divider">
          <span>Direct Role Sign-In</span>
        </div>

        <div className="role-quick-select-grid">
          <button
    type="button"
    className="role-quick-btn"
    onClick={() => selectRoleAccount("ADMIN", "admin@assettrack.com")}
  >
            <div className="role-quick-title">Administrator</div>
            <div className="role-quick-desc">Full system, users, categories</div>
          </button>

          <button
    type="button"
    className="role-quick-btn role-btn-primary"
    onClick={() => selectRoleAccount("ASSET_MANAGER", "manager@assettrack.com")}
  >
            <div className="role-quick-title">Asset Manager</div>
            <div className="role-quick-desc">Register, assign, returns, maintenance</div>
          </button>

          <button
    type="button"
    className="role-quick-btn"
    onClick={() => selectRoleAccount("EMPLOYEE", "employee@assettrack.com")}
  >
            <div className="role-quick-title">Employee</div>
            <div className="role-quick-desc">View assigned equipment & requests</div>
          </button>
        </div>

        <div className="login-compliance-footer">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
          <span>SOC2 Type II & ISO 27001 Enterprise Certified</span>
        </div>
      </div>
    </div>;
};
export {
  LoginPage
};
