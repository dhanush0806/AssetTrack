import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  ArrowRight,
  Laptop,
  Monitor,
  Smartphone,
  Server,
  Video,
  Armchair,
  Box
} from "lucide-react";
import { StorageService } from "../services/storageService";
import { Modal } from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import "./CategoriesPage.css";
const ICON_MAP = {
  Laptop,
  Monitor,
  Smartphone,
  Server,
  Video,
  Armchair,
  Box
};
const CategoriesPage = () => {
  const navigate = useNavigate();
  const { isManager, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lifespan, setLifespan] = useState(36);
  const [icon, setIcon] = useState("Box");
  const [error, setError] = useState("");
  const loadData = () => {
    setCategories(StorageService.getCategories());
  };
  useEffect(() => {
    loadData();
  }, []);
  const openAddModal = () => {
    setEditingCategory(null);
    setCode("");
    setName("");
    setDescription("");
    setLifespan(36);
    setIcon("Box");
    setError("");
    setShowModal(true);
  };
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCode(cat.code);
    setName(cat.name);
    setDescription(cat.description);
    setLifespan(cat.expectedLifespanMonths || 36);
    setIcon(cat.icon || "Box");
    setError("");
    setShowModal(true);
  };
  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Category code and name are required.");
      return;
    }
    try {
      StorageService.saveCategory({
        ...editingCategory ? { id: editingCategory.id } : {},
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        expectedLifespanMonths: Number(lifespan) || 36,
        icon
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to save category");
    }
  };
  return <div className="categories-page">
      <div className="cat-header">
        <div>
          <h1 className="cat-title">Asset Classifications & Categories</h1>
          <p className="cat-subtitle">
            Configure depreciation lifespans, categorization tags, and equipment grouping
          </p>
        </div>
        {isAdmin && <button type="button" className="btn-primary" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Category</span>
          </button>}
      </div>

      <div className="categories-grid">
        {categories.map((cat) => {
    const IconComp = ICON_MAP[cat.icon] || Box;
    return <div key={cat.id} className="category-card">
              <div className="cat-card-top">
                <div className="cat-icon-container">
                  <IconComp className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="cat-code-badge">{cat.code}</div>
              </div>

              <div className="cat-card-body">
                <h3 className="cat-name">{cat.name}</h3>
                <p className="cat-description">{cat.description}</p>

                <div className="cat-specs-box">
                  <div className="cat-stat">
                    <span className="cat-stat-label">Registered Assets</span>
                    <span className="cat-stat-val font-bold text-slate-900">
                      {cat.assetCount || 0} units
                    </span>
                  </div>
                  <div className="cat-stat">
                    <span className="cat-stat-label">Expected Lifespan</span>
                    <span className="cat-stat-val text-slate-700">
                      {cat.expectedLifespanMonths} months
                    </span>
                  </div>
                </div>
              </div>

              <div className="cat-card-footer">
                <button
      type="button"
      className="cat-view-btn"
      onClick={() => navigate(`/assets?category=${cat.id}`)}
    >
                  <span>Filter Assets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {isAdmin && <button
      type="button"
      className="cat-edit-btn"
      title="Edit category settings"
      onClick={() => openEditModal(cat)}
    >
                    <Edit className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900" />
                  </button>}
              </div>
            </div>;
  })}
      </div>

      <Modal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    title={editingCategory ? `Edit Category: ${editingCategory.name}` : "Create Asset Category"}
  >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Category Code *</label>
              <input
    type="text"
    required
    maxLength={6}
    placeholder="e.g. COMP"
    className="field-input font-mono uppercase"
    value={code}
    onChange={(e) => setCode(e.target.value.toUpperCase())}
  />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Category Name *</label>
              <input
    type="text"
    required
    placeholder="e.g. Workstations"
    className="field-input"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
            <textarea
    rows={2}
    className="field-textarea"
    placeholder="Scope of equipment included in this category..."
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Expected Lifespan (Months)</label>
              <input
    type="number"
    min={6}
    max={240}
    className="field-input"
    value={lifespan}
    onChange={(e) => setLifespan(parseInt(e.target.value, 10) || 36)}
  />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Icon</label>
              <select
    className="field-select"
    value={icon}
    onChange={(e) => setIcon(e.target.value)}
  >
                <option value="Laptop">Laptop / Workstation</option>
                <option value="Monitor">Monitor / Display</option>
                <option value="Smartphone">Smartphone / Tablet</option>
                <option value="Server">Server / Networking</option>
                <option value="Video">Video / Audio Conferencing</option>
                <option value="Armchair">Furniture / Seating</option>
                <option value="Box">Generic Hardware Box</option>
              </select>
            </div>
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
              {editingCategory ? "Update Category" : "Save Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  CategoriesPage
};
