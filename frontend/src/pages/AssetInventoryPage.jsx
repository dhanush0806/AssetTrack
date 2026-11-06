import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  FileDown,
  Eye,
  Edit,
  UserCheck,
  RotateCcw,
  Wrench,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { StatusBadge } from "../components/StatusBadge";
import { BarcodeBadge } from "../components/BarcodeBadge";
import { formatCurrency, formatDate, getWarrantyStatus } from "../utils/assetRules";
import { exportToCsv } from "../utils/exportToCsv";
import { useAuth } from "../context/AuthContext";
import "./AssetInventoryPage.css";
const AssetInventoryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isManager } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "ALL");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "ALL");
  const [selectedWarranty, setSelectedWarranty] = useState(searchParams.get("warranty") || "ALL");
  const [sortBy, setSortBy] = useState("purchaseDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    setCategories(StorageService.getCategories());
  }, [refreshKey]);
  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery !== null && urlQuery !== searchTerm) {
      setSearchTerm(urlQuery);
    }
    const urlStatus = searchParams.get("status");
    if (urlStatus !== null) {
      setSelectedStatus(urlStatus);
    }
  }, [searchParams]);
  const { assets, total } = useMemo(() => {
    return StorageService.getAssets({
      search: searchTerm,
      categoryId: selectedCategory === "ALL" ? void 0 : selectedCategory,
      status: selectedStatus === "ALL" ? void 0 : selectedStatus,
      warrantyStatus: selectedWarranty === "ALL" ? void 0 : selectedWarranty,
      sortBy,
      sortOrder,
      page: currentPage,
      pageSize
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedWarranty, sortBy, sortOrder, currentPage, refreshKey]);
  const totalPages = Math.ceil(total / pageSize) || 1;
  const handleExportCsv = () => {
    const allFiltered = StorageService.getAssets({
      search: searchTerm,
      categoryId: selectedCategory === "ALL" ? void 0 : selectedCategory,
      status: selectedStatus === "ALL" ? void 0 : selectedStatus,
      warrantyStatus: selectedWarranty === "ALL" ? void 0 : selectedWarranty,
      sortBy,
      sortOrder
    }).assets;
    exportToCsv(
      "assettrack_inventory_export",
      allFiltered.map((a) => ({
        "Asset Tag": a.assetTag,
        "Serial Number": a.serialNumber,
        Name: a.name,
        Category: a.categoryName,
        Brand: a.brand,
        Model: a.model,
        Status: a.status,
        Cost: a.purchaseCost,
        "Purchase Date": a.purchaseDate,
        "Warranty Expiry": a.warrantyExpiryDate,
        "Current Assignee": a.currentAssigneeName || "Unassigned",
        Location: a.location
      }))
    );
  };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSelectedWarranty("ALL");
    setCurrentPage(1);
    setSearchParams({});
  };
  return <div className="inventory-page">
      {
    /* Header */
  }
      <div className="inventory-header">
        <div>
          <h1 className="inventory-title">Asset Inventory</h1>
          <p className="inventory-subtitle">
            Catalog and physical tracking of all enterprise hardware, IT devices, and equipment
          </p>
        </div>
        <div className="inventory-actions">
          <button type="button" className="btn-secondary" onClick={handleExportCsv}>
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </button>
          {isManager && <button
    type="button"
    className="btn-primary"
    onClick={() => navigate("/assets/new")}
  >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Register New Asset</span>
            </button>}
        </div>
      </div>

      {
    /* Filter and Search Bar */
  }
      <div className="inventory-filter-panel">
        <div className="search-box-row">
          <div className="search-field">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
    type="text"
    placeholder="Search by name, tag, serial number, brand, model, or assignee..."
    className="search-input"
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    }}
  />
          </div>
          {(searchTerm || selectedCategory !== "ALL" || selectedStatus !== "ALL" || selectedWarranty !== "ALL") && <button type="button" className="clear-filters-btn" onClick={clearFilters}>
              Reset Filters
            </button>}
        </div>

        <div className="filter-controls-row">
          <div className="filter-item">
            <label className="filter-label">Category</label>
            <select
    className="filter-select"
    value={selectedCategory}
    onChange={(e) => {
      setSelectedCategory(e.target.value);
      setCurrentPage(1);
    }}
  >
              <option value="ALL">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>
                  {c.name}
                </option>)}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Lifecycle Status</label>
            <select
    className="filter-select"
    value={selectedStatus}
    onChange={(e) => {
      setSelectedStatus(e.target.value);
      setCurrentPage(1);
    }}
  >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Warranty Expiry</label>
            <select
    className="filter-select"
    value={selectedWarranty}
    onChange={(e) => {
      setSelectedWarranty(e.target.value);
      setCurrentPage(1);
    }}
  >
              <option value="ALL">Any Warranty Period</option>
              <option value="EXPIRED">Already Expired</option>
              <option value="EXPIRING_30">Expiring in 30 Days</option>
              <option value="EXPIRING_60">Expiring in 60 Days</option>
              <option value="ACTIVE">Active & Protected</option>
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Sort Order</label>
            <div className="sort-controls">
              <select
    className="filter-select"
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
  >
                <option value="purchaseDate">Purchase Date</option>
                <option value="name">Asset Name</option>
                <option value="assetTag">Asset Tag</option>
                <option value="purchaseCost">Purchase Cost</option>
                <option value="warrantyExpiryDate">Warranty Expiry</option>
              </select>
              <button
    type="button"
    className="sort-direction-btn"
    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
    title={sortOrder === "asc" ? "Ascending" : "Descending"}
  >
                {sortOrder === "asc" ? "\u2191 Asc" : "\u2193 Desc"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {
    /* Quick Status Count Chips */
  }
      <div className="status-chips-bar">
        <button
    type="button"
    className={`status-chip ${selectedStatus === "ALL" ? "active" : ""}`}
    onClick={() => setSelectedStatus("ALL")}
  >
          All Assets ({StorageService.getAssets().total})
        </button>
        <button
    type="button"
    className={`status-chip chip-available ${selectedStatus === "AVAILABLE" ? "active" : ""}`}
    onClick={() => setSelectedStatus("AVAILABLE")}
  >
          Available
        </button>
        <button
    type="button"
    className={`status-chip chip-assigned ${selectedStatus === "ASSIGNED" ? "active" : ""}`}
    onClick={() => setSelectedStatus("ASSIGNED")}
  >
          Assigned
        </button>
        <button
    type="button"
    className={`status-chip chip-maintenance ${selectedStatus === "UNDER_MAINTENANCE" ? "active" : ""}`}
    onClick={() => setSelectedStatus("UNDER_MAINTENANCE")}
  >
          Under Maintenance
        </button>
        <button
    type="button"
    className={`status-chip chip-retired ${selectedStatus === "RETIRED" ? "active" : ""}`}
    onClick={() => setSelectedStatus("RETIRED")}
  >
          Retired
        </button>
      </div>

      {
    /* Asset Table */
  }
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Asset Identifier</th>
              <th>Make & Model</th>
              <th>Category</th>
              <th>Status</th>
              <th>Current Assignee</th>
              <th>Warranty</th>
              <th>Cost</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? <tr>
                <td colSpan={8} className="empty-state-cell">
                  <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="font-semibold text-slate-700">No assets found</div>
                  <p className="text-xs text-slate-500">Try adjusting your search criteria or filters</p>
                </td>
              </tr> : assets.map((asset) => {
    const wStatus = getWarrantyStatus(asset.warrantyExpiryDate);
    return <tr key={asset.id} className="inventory-row">
                    <td>
                      <div className="flex flex-col gap-1">
                        <BarcodeBadge assetTag={asset.assetTag} size="sm" />
                        <span className="text-xs text-slate-500 font-mono">SN: {asset.serialNumber}</span>
                      </div>
                    </td>
                    <td>
                      <div
      className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
      onClick={() => navigate(`/assets/${asset.id}`)}
    >
                        {asset.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {asset.brand} • {asset.model}
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{asset.categoryName}</span>
                    </td>
                    <td>
                      <StatusBadge status={asset.status} />
                    </td>
                    <td>
                      {asset.currentAssigneeName ? <div
      className="assignee-link"
      onClick={() => asset.currentAssigneeId && navigate(`/employees/${asset.currentAssigneeId}`)}
    >
                          <span className="font-medium text-slate-800">{asset.currentAssigneeName}</span>
                          <span className="text-xs text-slate-400 block">{asset.location}</span>
                        </div> : <span className="text-xs text-slate-400 italic">In Inventory ({asset.location})</span>}
                    </td>
                    <td>
                      <div className="warranty-status-cell">
                        <span
      className={`warranty-indicator indicator-${wStatus.status.toLowerCase()}`}
    />
                        <span className="text-xs text-slate-700">{formatDate(asset.warrantyExpiryDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {formatCurrency(asset.purchaseCost)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions-cell">
                        <button
      type="button"
      className="action-icon-btn"
      title="View Asset Details"
      onClick={() => navigate(`/assets/${asset.id}`)}
    >
                          <Eye className="w-4 h-4 text-slate-600 hover:text-blue-600" />
                        </button>

                        {isManager && <>
                            {asset.status === "AVAILABLE" && <button
      type="button"
      className="action-icon-btn"
      title="Assign to Employee"
      onClick={() => navigate(`/assign?assetId=${asset.id}`)}
    >
                                <UserCheck className="w-4 h-4 text-emerald-600 hover:text-emerald-700" />
                              </button>}

                            {asset.status === "ASSIGNED" && <button
      type="button"
      className="action-icon-btn"
      title="Process Asset Return"
      onClick={() => navigate(`/returns?assetId=${asset.id}`)}
    >
                                <RotateCcw className="w-4 h-4 text-blue-600 hover:text-blue-700" />
                              </button>}

                            <button
      type="button"
      className="action-icon-btn"
      title="Schedule Maintenance"
      onClick={() => navigate(`/maintenance?assetId=${asset.id}`)}
    >
                              <Wrench className="w-4 h-4 text-amber-600 hover:text-amber-700" />
                            </button>

                            <button
      type="button"
      className="action-icon-btn"
      title="Edit Specifications"
      onClick={() => navigate(`/assets/${asset.id}/edit`)}
    >
                              <Edit className="w-4 h-4 text-slate-500 hover:text-slate-800" />
                            </button>
                          </>}
                      </div>
                    </td>
                  </tr>;
  })}
          </tbody>
        </table>
      </div>

      {
    /* Pagination Footer */
  }
      <div className="pagination-footer">
        <div className="pagination-info">
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-900">
            {Math.min(currentPage * pageSize, total)}
          </span>{" "}
          of <span className="font-semibold text-slate-900">{total}</span> total assets
        </div>

        <div className="pagination-controls">
          <button
    type="button"
    className="pagination-btn"
    disabled={currentPage <= 1}
    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
  >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
    type="button"
    className="pagination-btn"
    disabled={currentPage >= totalPages}
    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
  >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>;
};
export {
  AssetInventoryPage
};
