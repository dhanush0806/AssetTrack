function canAssignAsset(asset) {
  if (asset.status === "ASSIGNED") {
    return { allowed: false, reason: "Asset is currently assigned to another employee. Return it first." };
  }
  if (asset.status === "UNDER_MAINTENANCE") {
    return { allowed: false, reason: "Asset is under maintenance and cannot be issued until repairs are complete." };
  }
  if (asset.status === "RETIRED") {
    return { allowed: false, reason: "Asset has been retired from service and cannot be reassigned." };
  }
  if (asset.status === "AVAILABLE") {
    return { allowed: true };
  }
  return { allowed: false, reason: `Unknown asset status: ${asset.status}` };
}
function canSendToMaintenance(asset) {
  if (asset.status === "RETIRED") {
    return { allowed: false, reason: "Retired assets cannot be scheduled for maintenance." };
  }
  return { allowed: true };
}
function canReplaceAsset(oldAsset, newAsset) {
  if (oldAsset.status !== "ASSIGNED" || !oldAsset.currentAssigneeId) {
    return { allowed: false, reason: "Only currently assigned assets can be replaced or swapped." };
  }
  if (newAsset.status !== "AVAILABLE") {
    return { allowed: false, reason: `Replacement asset must be Available (currently ${newAsset.status}).` };
  }
  return { allowed: true };
}
function getWarrantyStatus(warrantyExpiryDate, referenceDate = /* @__PURE__ */ new Date()) {
  const expiry = new Date(warrantyExpiryDate);
  const diffTime = expiry.getTime() - referenceDate.getTime();
  const daysRemaining = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  if (daysRemaining < 0) {
    return {
      status: "EXPIRED",
      daysRemaining,
      label: `Expired ${Math.abs(daysRemaining)} days ago`
    };
  }
  if (daysRemaining <= 30) {
    return {
      status: "EXPIRING_30",
      daysRemaining,
      label: `Expires in ${daysRemaining} days (Critical)`
    };
  }
  if (daysRemaining <= 60) {
    return {
      status: "EXPIRING_60",
      daysRemaining,
      label: `Expires in ${daysRemaining} days (Warning)`
    };
  }
  if (daysRemaining <= 90) {
    return {
      status: "EXPIRING_90",
      daysRemaining,
      label: `Expires in ${daysRemaining} days (Upcoming)`
    };
  }
  return {
    status: "ACTIVE",
    daysRemaining,
    label: `Active (${daysRemaining} days left)`
  };
}
function calculateDepreciatedValue(purchaseCost, purchaseDateStr, lifespanMonths, asOfDate = /* @__PURE__ */ new Date()) {
  if (purchaseCost <= 0) return 0;
  if (lifespanMonths <= 0) return purchaseCost;
  const purchaseDate = new Date(purchaseDateStr);
  const monthsElapsed = (asOfDate.getFullYear() - purchaseDate.getFullYear()) * 12 + (asOfDate.getMonth() - purchaseDate.getMonth());
  if (monthsElapsed <= 0) return purchaseCost;
  const salvageValue = purchaseCost * 0.1;
  const depreciableAmount = purchaseCost - salvageValue;
  const monthlyDepreciation = depreciableAmount / lifespanMonths;
  const totalDepreciation = Math.min(monthsElapsed * monthlyDepreciation, depreciableAmount);
  return Math.round((purchaseCost - totalDepreciation) * 100) / 100;
}
function generateAssetTag(prefix, sequenceNumber) {
  const padded = String(sequenceNumber).padStart(4, "0");
  const cleanPrefix = (prefix || "AST").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${cleanPrefix}-${padded}`;
}
function validateAssetInput(data) {
  const errors = {};
  if (!data.assetTag || !data.assetTag.trim()) {
    errors.assetTag = "Asset Tag is required";
  } else if (!/^[A-Za-z0-9-_]+$/.test(data.assetTag.trim())) {
    errors.assetTag = "Asset Tag can only contain letters, numbers, dashes and underscores";
  }
  if (!data.serialNumber || !data.serialNumber.trim()) {
    errors.serialNumber = "Serial Number is required";
  }
  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Asset Name must be at least 3 characters";
  }
  if (!data.categoryId) {
    errors.categoryId = "Category selection is required";
  }
  if (!data.brand || !data.brand.trim()) {
    errors.brand = "Brand is required";
  }
  if (!data.model || !data.model.trim()) {
    errors.model = "Model is required";
  }
  if (data.purchaseCost === void 0 || isNaN(data.purchaseCost) || data.purchaseCost < 0) {
    errors.purchaseCost = "Purchase cost must be a non-negative number";
  }
  if (!data.purchaseDate) {
    errors.purchaseDate = "Purchase date is required";
  }
  if (!data.warrantyExpiryDate) {
    errors.warrantyExpiryDate = "Warranty expiry date is required";
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0);
}
function formatDate(dateString) {
  if (!dateString) return "\u2014";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateString;
  }
}
export {
  calculateDepreciatedValue,
  canAssignAsset,
  canReplaceAsset,
  canSendToMaintenance,
  formatCurrency,
  formatDate,
  generateAssetTag,
  getWarrantyStatus,
  validateAssetInput
};
