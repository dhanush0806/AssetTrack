import { useNavigate } from "react-router-dom";
import { ShieldAlert, LayoutDashboard, Boxes } from "lucide-react";
import "./NotFoundPage.css";
const NotFoundPage = () => {
  const navigate = useNavigate();
  return <div className="not-found-root">
      <div className="not-found-card">
        <div className="not-found-icon-box">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <span className="not-found-status font-mono">404 — PAGE NOT FOUND</span>
        <h1 className="not-found-title">Resource Does Not Exist</h1>
        <p className="not-found-desc">
          The requested system asset, record, or navigation route could not be found within the AssetTrack enterprise directory.
        </p>

        <div className="not-found-actions">
          <button
    type="button"
    className="btn-primary"
    onClick={() => navigate("/dashboard")}
  >
            <LayoutDashboard className="w-4 h-4 mr-1.5" />
            <span>Return to Dashboard</span>
          </button>
          <button
    type="button"
    className="btn-secondary"
    onClick={() => navigate("/assets")}
  >
            <Boxes className="w-4 h-4 mr-1.5" />
            <span>Search Asset Inventory</span>
          </button>
        </div>
      </div>
    </div>;
};
export {
  NotFoundPage
};
