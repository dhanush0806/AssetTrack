import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Barcode,
  Building,
  DollarSign,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { generateAssetTag, validateAssetInput } from "../utils/assetRules";
import "./AssetFormPage.css";
const AssetFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    assetTag: "",
    serialNumber: "",
    name: "",
    categoryId: "",
    brand: "",
    model: "",
    purchaseDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    purchaseCost: 1499,
    warrantyExpiryDate: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1e3).toISOString().slice(0, 10),
    status: "AVAILABLE",
    location: "Central Storage Room A",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  useEffect(() => {
    const loadedCats = StorageService.getCategories();
    setCategories(loadedCats);
    if (isEditMode && id) {
      const existing = StorageService.getAssetById(id);
      if (existing) {
        setFormData({
          assetTag: existing.assetTag,
          serialNumber: existing.serialNumber,
          name: existing.name,
          categoryId: existing.categoryId,
          brand: existing.brand,
          model: existing.model,
          purchaseDate: existing.purchaseDate,
          purchaseCost: existing.purchaseCost,
          warrantyExpiryDate: existing.warrantyExpiryDate,
          status: existing.status,
          location: existing.location,
          notes: existing.notes || ""
        });
      } else {
        navigate("/assets");
      }
    } else {
      const { total } = StorageService.getAssets();
      const suggested = generateAssetTag("AST", 1e3 + total + 1);
      setFormData((prev) => ({
        ...prev,
        assetTag: suggested,
        categoryId: loadedCats[0]?.id || "cat-1"
      }));
    }
  }, [id, isEditMode, navigate]);
  const handleGenerateSerial = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const brandPrefix = (formData.brand || "GEN").substring(0, 3).toUpperCase();
    setFormData((prev) => ({ ...prev, serialNumber: `${brandPrefix}-${randomHex}-SN` }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    const validation = validateAssetInput(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    try {
      const saved = StorageService.saveAsset({
        ...isEditMode && id ? { id } : {},
        ...formData
      });
      navigate(`/assets/${saved.id}`);
    } catch (err) {
      setServerError(err.message || "Failed to save asset.");
    }
  };
  return <div className="asset-form-page">
      <div className="form-header">
        <button
    type="button"
    className="back-btn"
    onClick={() => navigate(isEditMode && id ? `/assets/${id}` : "/assets")}
  >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to {isEditMode ? "Asset Details" : "Inventory"}</span>
        </button>
        <h1 className="form-title">
          {isEditMode ? `Edit Asset: ${formData.assetTag}` : "Register New Equipment Asset"}
        </h1>
        <p className="form-subtitle">
          Ensure exact serial number and warranty term records for compliance tracking
        </p>
      </div>

      {serverError && <div className="error-banner">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{serverError}</span>
        </div>}

      <form onSubmit={handleSubmit} className="form-container">
        {
    /* Section 1: Identification */
  }
        <div className="form-section">
          <div className="section-header">
            <Barcode className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="section-title">Hardware Identification & Classification</h2>
              <p className="section-desc">Unique asset tag, serial number, and product nomenclature</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="assetTag" className="field-label required">Asset Tag / ID</label>
              <input
    id="assetTag"
    type="text"
    className={`field-input font-mono ${errors.assetTag ? "input-error" : ""}`}
    placeholder="e.g. AST-1045"
    value={formData.assetTag}
    disabled={isEditMode}
    onChange={(e) => setFormData({ ...formData, assetTag: e.target.value.toUpperCase() })}
  />
              {errors.assetTag && <span className="error-msg">{errors.assetTag}</span>}
            </div>

            <div className="form-field">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="serialNumber" className="field-label required">Manufacturer Serial Number</label>
                {!isEditMode && <button
    type="button"
    className="helper-action-link"
    onClick={handleGenerateSerial}
  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    <span>Auto-generate</span>
                  </button>}
              </div>
              <input
    id="serialNumber"
    type="text"
    className={`field-input font-mono ${errors.serialNumber ? "input-error" : ""}`}
    placeholder="e.g. C02FX93AMD6R"
    value={formData.serialNumber}
    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
  />
              {errors.serialNumber && <span className="error-msg">{errors.serialNumber}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="name" className="field-label required">Asset Name / Title</label>
              <input
    id="name"
    type="text"
    className={`field-input ${errors.name ? "input-error" : ""}`}
    placeholder="e.g. MacBook Pro 16&quot; M3 Max"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="categoryId" className="field-label required">Category</label>
              <select
    id="categoryId"
    className="field-select"
    value={formData.categoryId}
    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
  >
                {categories.map((cat) => <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.code})
                  </option>)}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="brand" className="field-label required">Manufacturer / Brand</label>
              <input
    id="brand"
    type="text"
    className="field-input"
    placeholder="e.g. Apple, Dell, Cisco, Logitech"
    value={formData.brand}
    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
  />
              {errors.brand && <span className="error-msg">{errors.brand}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="model" className="field-label required">Model / Specification Details</label>
              <input
    id="model"
    type="text"
    className="field-input"
    placeholder="e.g. XPS 15 9530 (32GB / 1TB)"
    value={formData.model}
    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
  />
              {errors.model && <span className="error-msg">{errors.model}</span>}
            </div>
          </div>
        </div>

        {
    /* Section 2: Procurement & Warranty */
  }
        <div className="form-section">
          <div className="section-header">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="section-title">Procurement & Warranty Coverage</h2>
              <p className="section-desc">Financial cost tracking and vendor warranty terms</p>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-field">
              <label htmlFor="purchaseCost" className="field-label required">Purchase Cost ($ USD)</label>
              <input
    id="purchaseCost"
    type="number"
    step="0.01"
    min="0"
    className="field-input font-mono"
    value={formData.purchaseCost}
    onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
  />
              {errors.purchaseCost && <span className="error-msg">{errors.purchaseCost}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="purchaseDate" className="field-label required">Purchase / Invoice Date</label>
              <div className="relative">
                <input
    id="purchaseDate"
    type="date"
    className="field-input"
    value={formData.purchaseDate}
    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
  />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="warrantyExpiryDate" className="field-label required">Warranty Expiry Date</label>
              <div className="relative">
                <input
    id="warrantyExpiryDate"
    type="date"
    className="field-input"
    value={formData.warrantyExpiryDate}
    onChange={(e) => setFormData({ ...formData, warrantyExpiryDate: e.target.value })}
  />
              </div>
            </div>
          </div>
        </div>

        {
    /* Section 3: Status & Deployment Location */
  }
        <div className="form-section">
          <div className="section-header">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="section-title">Location & Operational Notes</h2>
              <p className="section-desc">Physical placement and administrative notes</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="status" className="field-label required">Current Status</label>
              <select
    id="status"
    className="field-select"
    value={formData.status}
    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
  >
                <option value="AVAILABLE">Available (In Storage)</option>
                <option value="ASSIGNED">Assigned (In Use)</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance (Repair / Diagnostic)</option>
                <option value="RETIRED">Retired (Decommissioned)</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="location" className="field-label required">Physical Location / Storage Room</label>
              <input
    id="location"
    type="text"
    className="field-input"
    placeholder="e.g. San Francisco HQ - Storage Room A"
    value={formData.location}
    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
  />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="notes" className="field-label">Administrative Notes & Accessories</label>
            <textarea
    id="notes"
    rows={3}
    className="field-textarea"
    placeholder="e.g. Includes power supply, Thunderbolt dock, and carrying case..."
    value={formData.notes}
    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
  />
          </div>
        </div>

        {
    /* Submit Actions */
  }
        <div className="form-submit-footer">
          <button
    type="button"
    className="btn-cancel"
    onClick={() => navigate("/assets")}
  >
            Cancel
          </button>
          <button type="submit" className="btn-save">
            <Save className="w-4 h-4 mr-2" />
            <span>{isEditMode ? "Update Asset Record" : "Register Equipment"}</span>
          </button>
        </div>
      </form>
    </div>;
};
export {
  AssetFormPage
};
