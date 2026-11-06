import { useState } from "react";
import {
  FileDown,
  CheckCircle2,
  Boxes,
  Wrench,
  ShieldAlert,
  Users
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { exportToCsv } from "../utils/exportToCsv";
import { formatCurrency, getWarrantyStatus } from "../utils/assetRules";
import "./ReportsPage.css";
const ReportsPage = () => {
  const [reportType, setReportType] = useState("INVENTORY");
  const [downloadSuccess, setDownloadSuccess] = useState("");
  const metrics = StorageService.getDashboardMetrics();
  const { assets } = StorageService.getAssets();
  const maintenance = StorageService.getMaintenanceRecords();
  const assignments = StorageService.getAssignments();
  const handleExport = (type) => {
    if (type === "INVENTORY") {
      exportToCsv(
        "assettrack_master_inventory_report",
        assets.map((a) => ({
          "Asset Tag": a.assetTag,
          "Serial Number": a.serialNumber,
          Name: a.name,
          Category: a.categoryName,
          Brand: a.brand,
          Model: a.model,
          Status: a.status,
          "Cost ($)": a.purchaseCost,
          "Purchase Date": a.purchaseDate,
          "Warranty Expiry": a.warrantyExpiryDate,
          "Current Custody": a.currentAssigneeName || "In Stock",
          Location: a.location,
          Notes: a.notes || ""
        }))
      );
      setDownloadSuccess("Master Asset Inventory report downloaded.");
    } else if (type === "MAINTENANCE") {
      exportToCsv(
        "assettrack_maintenance_expenditure_report",
        maintenance.map((m) => ({
          "Ticket ID": m.id,
          "Asset Tag": m.assetTag,
          "Asset Name": m.assetName,
          Issue: m.issueDescription,
          "Reported Date": m.reportedDate,
          "Completed Date": m.completedDate || "Pending",
          Provider: m.serviceProvider,
          Technician: m.technicianName || "N/A",
          "Repair Cost ($)": m.cost,
          Status: m.status,
          "Resolution Details": m.resolutionNotes || "In Progress"
        }))
      );
      setDownloadSuccess("Maintenance Expenditure report downloaded.");
    } else if (type === "ASSIGNMENTS") {
      exportToCsv(
        "assettrack_custody_assignment_report",
        assignments.map((a) => ({
          "Assignment ID": a.id,
          "Asset Tag": a.assetTag,
          "Asset Name": a.assetName,
          Employee: a.employeeName,
          Department: a.department,
          "Issued Date": a.assignedDate,
          "Expected Return": a.expectedReturnDate || "N/A",
          "Returned Date": a.returnedDate || "Active",
          Condition: a.returnCondition || "N/A",
          Status: a.status
        }))
      );
      setDownloadSuccess("Employee Equipment Custody report downloaded.");
    } else if (type === "WARRANTY") {
      exportToCsv(
        "assettrack_warranty_risk_report",
        assets.map((a) => {
          const ws = getWarrantyStatus(a.warrantyExpiryDate);
          return {
            "Asset Tag": a.assetTag,
            Name: a.name,
            Brand: a.brand,
            Model: a.model,
            "Warranty Expiry Date": a.warrantyExpiryDate,
            "Coverage Status": ws.status,
            "Days Remaining": ws.daysRemaining,
            "Current Assignee": a.currentAssigneeName || "In Storage"
          };
        })
      );
      setDownloadSuccess("Warranty & Support Risk report downloaded.");
    }
    setTimeout(() => setDownloadSuccess(""), 4e3);
  };
  return <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Corporate Asset & Financial Reports</h1>
          <p className="reports-subtitle">
            Generate and export CSV reports for audits, IT depreciation accounting, and vendor warranties
          </p>
        </div>
      </div>

      {downloadSuccess && <div className="download-alert">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
          <span>{downloadSuccess}</span>
        </div>}

      {
    /* Available Reports Grid */
  }
      <div className="reports-grid">
        {
    /* Report 1 */
  }
        <div className="report-card">
          <div className="report-card-icon-box bg-blue-50 text-blue-600">
            <Boxes className="w-6 h-6" />
          </div>
          <div className="report-card-body">
            <h2 className="report-name">Master Asset Inventory</h2>
            <p className="report-desc">
              Comprehensive portfolio of all {assets.length} equipment units, purchase costs, serial numbers, locations, and status.
            </p>
            <div className="report-stat-pill">
              Total Valuation: <strong className="font-mono">{formatCurrency(metrics.totalValuation)}</strong>
            </div>
          </div>
          <button
    type="button"
    className="report-download-btn"
    onClick={() => handleExport("INVENTORY")}
  >
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {
    /* Report 2 */
  }
        <div className="report-card">
          <div className="report-card-icon-box bg-amber-50 text-amber-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="report-card-body">
            <h2 className="report-name">Maintenance & Repair Log</h2>
            <p className="report-desc">
              Complete diagnostic record, vendor repair invoices, technician resolutions, and total repair expenses.
            </p>
            <div className="report-stat-pill">
              Total Invoiced: <strong className="font-mono">{formatCurrency(maintenance.reduce((s, m) => s + (m.cost || 0), 0))}</strong>
            </div>
          </div>
          <button
    type="button"
    className="report-download-btn"
    onClick={() => handleExport("MAINTENANCE")}
  >
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {
    /* Report 3 */
  }
        <div className="report-card">
          <div className="report-card-icon-box bg-indigo-50 text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div className="report-card-body">
            <h2 className="report-name">Employee Custody & Checkouts</h2>
            <p className="report-desc">
              Audit trail of every asset issued to employees, checkout dates, return dates, condition remarks, and department breakdown.
            </p>
            <div className="report-stat-pill">
              Total Records: <strong>{assignments.length} assignments</strong>
            </div>
          </div>
          <button
    type="button"
    className="report-download-btn"
    onClick={() => handleExport("ASSIGNMENTS")}
  >
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {
    /* Report 4 */
  }
        <div className="report-card">
          <div className="report-card-icon-box bg-rose-50 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="report-card-body">
            <h2 className="report-name">Warranty Expiry & Risk Exposure</h2>
            <p className="report-desc">
              Audit schedule detailing manufacturer contract expirations, unprotected equipment, and renewal deadlines.
            </p>
            <div className="report-stat-pill">
              Exposures: <strong className="text-rose-700">{metrics.expiredWarranties + metrics.expiringWarranties30Days} units at risk</strong>
            </div>
          </div>
          <button
    type="button"
    className="report-download-btn"
    onClick={() => handleExport("WARRANTY")}
  >
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>;
};
export {
  ReportsPage
};
