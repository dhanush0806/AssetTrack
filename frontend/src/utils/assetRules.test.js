import test from "node:test";
import assert from "node:assert/strict";
import {
  canAssignAsset,
  canSendToMaintenance,
  canReplaceAsset,
  getWarrantyStatus,
  calculateDepreciatedValue,
  generateAssetTag,
  validateAssetInput
} from "./assetRules.js";
test("canAssignAsset allows only AVAILABLE assets", () => {
  assert.equal(canAssignAsset({ status: "AVAILABLE" }).allowed, true);
  assert.equal(canAssignAsset({ status: "ASSIGNED" }).allowed, false);
  assert.equal(canAssignAsset({ status: "UNDER_MAINTENANCE" }).allowed, false);
  assert.equal(canAssignAsset({ status: "RETIRED" }).allowed, false);
});
test("canReplaceAsset validates old asset is assigned and replacement is available", () => {
  assert.equal(
    canReplaceAsset({ status: "ASSIGNED", currentAssigneeId: "emp-1" }, { status: "AVAILABLE" }).allowed,
    true
  );
  assert.equal(
    canReplaceAsset({ status: "AVAILABLE", currentAssigneeId: null }, { status: "AVAILABLE" }).allowed,
    false
  );
  assert.equal(
    canReplaceAsset({ status: "ASSIGNED", currentAssigneeId: "emp-1" }, { status: "UNDER_MAINTENANCE" }).allowed,
    false
  );
});
test("canSendToMaintenance blocks RETIRED assets", () => {
  assert.equal(canSendToMaintenance({ status: "AVAILABLE" }).allowed, true);
  assert.equal(canSendToMaintenance({ status: "ASSIGNED" }).allowed, true);
  assert.equal(canSendToMaintenance({ status: "RETIRED" }).allowed, false);
});
test("getWarrantyStatus accurately categorizes expired and expiring assets", () => {
  const refDate = /* @__PURE__ */ new Date("2026-10-27T00:00:00Z");
  const expired = getWarrantyStatus("2026-10-01", refDate);
  assert.equal(expired.status, "EXPIRED");
  const expiring15 = getWarrantyStatus("2026-11-10", refDate);
  assert.equal(expiring15.status, "EXPIRING_30");
  const expiring45 = getWarrantyStatus("2026-12-10", refDate);
  assert.equal(expiring45.status, "EXPIRING_60");
  const active = getWarrantyStatus("2027-10-27", refDate);
  assert.equal(active.status, "ACTIVE");
});
test("calculateDepreciatedValue correctly calculates straight line depreciation with salvage floor", () => {
  const cost = 1e3;
  const lifespanMonths = 36;
  const purchaseDate = "2026-01-01";
  const asOf = /* @__PURE__ */ new Date("2026-11-01");
  const value = calculateDepreciatedValue(cost, purchaseDate, lifespanMonths, asOf);
  assert.equal(value, 750);
});
test("generateAssetTag generates zero-padded tags", () => {
  assert.equal(generateAssetTag("AST", 42), "AST-0042");
  assert.equal(generateAssetTag("LAP", 1045), "LAP-1045");
});
test("validateAssetInput catches missing or invalid fields", () => {
  const invalid = validateAssetInput({
    assetTag: "",
    serialNumber: ""
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.assetTag);
  assert.ok(invalid.errors.serialNumber);
  assert.ok(invalid.errors.name);
  const valid = validateAssetInput({
    assetTag: "AST-1001",
    serialNumber: "SN-998877",
    name: 'MacBook Pro 16"',
    categoryId: "cat-1",
    brand: "Apple",
    model: "M3 Max 36GB",
    purchaseCost: 3499,
    purchaseDate: "2024-03-15",
    warrantyExpiryDate: "2027-03-15"
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});
