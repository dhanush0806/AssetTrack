import {
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_ASSETS,
  INITIAL_ASSIGNMENTS,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS
} from "./seedData";
import { canAssignAsset, getWarrantyStatus } from "../utils/assetRules";
const STORAGE_KEYS = {
  CATEGORIES: "assettrack_categories_v1",
  USERS: "assettrack_users_v1",
  EMPLOYEES: "assettrack_employees_v1",
  ASSETS: "assettrack_assets_v1",
  ASSIGNMENTS: "assettrack_assignments_v1",
  MAINTENANCE: "assettrack_maintenance_v1",
  NOTIFICATIONS: "assettrack_notifications_v1",
  ACTIVITY_LOGS: "assettrack_activity_logs_v1",
  CURRENT_USER: "assettrack_current_user_v1"
};
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Storage error:", err);
  }
}
class StorageService {
  // Categories
  static getCategories() {
    const categories = load(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const { assets } = this.getAssets();
    return categories.map((cat) => ({
      ...cat,
      assetCount: assets.filter((a) => a.categoryId === cat.id).length
    }));
  }
  static saveCategory(category) {
    const categories = this.getCategories();
    let updated;
    if (category.id) {
      const idx = categories.findIndex((c) => c.id === category.id);
      if (idx >= 0) {
        categories[idx] = { ...categories[idx], ...category };
        updated = categories[idx];
      } else {
        throw new Error("Category not found");
      }
    } else {
      updated = {
        id: `cat-${Date.now()}`,
        code: category.code.toUpperCase().trim(),
        name: category.name.trim(),
        description: category.description || "",
        icon: category.icon || "Box",
        expectedLifespanMonths: Number(category.expectedLifespanMonths) || 36,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      categories.push(updated);
    }
    save(STORAGE_KEYS.CATEGORIES, categories);
    return updated;
  }
  // Assets
  static getAssets(filters) {
    let list = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const categories = load(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    list = list.map((a) => ({
      ...a,
      categoryName: catMap.get(a.categoryId) || a.categoryName || "General"
    }));
    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (a) => a.name.toLowerCase().includes(q) || a.assetTag.toLowerCase().includes(q) || a.serialNumber.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q) || a.model.toLowerCase().includes(q) || a.currentAssigneeName && a.currentAssigneeName.toLowerCase().includes(q)
        );
      }
      if (filters.categoryId && filters.categoryId !== "ALL") {
        list = list.filter((a) => a.categoryId === filters.categoryId);
      }
      if (filters.status && filters.status !== "ALL") {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters.warrantyStatus && filters.warrantyStatus !== "ALL") {
        list = list.filter((a) => {
          const ws = getWarrantyStatus(a.warrantyExpiryDate).status;
          return ws === filters.warrantyStatus;
        });
      }
      if (filters.sortBy) {
        const order = filters.sortOrder === "desc" ? -1 : 1;
        list.sort((a, b) => {
          const valA = a[filters.sortBy];
          const valB = b[filters.sortBy];
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
      }
    }
    const total = list.length;
    if (filters && filters.page && filters.pageSize) {
      const start = (filters.page - 1) * filters.pageSize;
      list = list.slice(start, start + filters.pageSize);
    }
    return { assets: list, total };
  }
  static getAssetById(id) {
    const { assets } = this.getAssets();
    return assets.find((a) => a.id === id || a.assetTag === id) || null;
  }
  static saveAsset(assetData) {
    const assets = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    let saved;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (assetData.id) {
      const idx = assets.findIndex((a) => a.id === assetData.id);
      if (idx >= 0) {
        assets[idx] = {
          ...assets[idx],
          ...assetData,
          updatedAt: now
        };
        saved = assets[idx];
      } else {
        throw new Error("Asset not found");
      }
    } else {
      const existing = assets.find((a) => a.assetTag.toLowerCase() === assetData.assetTag.toLowerCase());
      if (existing) {
        throw new Error(`Asset Tag "${assetData.assetTag}" is already registered. Tags must be unique.`);
      }
      saved = {
        id: `ast-${Date.now()}`,
        assetTag: assetData.assetTag.toUpperCase().trim(),
        serialNumber: assetData.serialNumber?.trim() || `SN-${Date.now()}`,
        name: assetData.name.trim(),
        categoryId: assetData.categoryId || "cat-1",
        brand: assetData.brand?.trim() || "",
        model: assetData.model?.trim() || "",
        purchaseDate: assetData.purchaseDate || now.slice(0, 10),
        purchaseCost: Number(assetData.purchaseCost) || 0,
        warrantyExpiryDate: assetData.warrantyExpiryDate || now.slice(0, 10),
        status: assetData.status || "AVAILABLE",
        location: assetData.location?.trim() || "Central Storage",
        notes: assetData.notes?.trim() || "",
        createdAt: now,
        updatedAt: now
      };
      assets.unshift(saved);
    }
    save(STORAGE_KEYS.ASSETS, assets);
    this.addActivityLog("SAVE_ASSET", "ASSET", saved.id, `Saved asset details for ${saved.name} (${saved.assetTag})`);
    return saved;
  }
  // Assignment Transaction
  static assignAsset(params) {
    const assets = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const employees = this.getEmployees();
    const asset = assets.find((a) => a.id === params.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }
    const check = canAssignAsset(asset);
    if (!check.allowed) {
      throw new Error(check.reason || "Asset is not available for assignment.");
    }
    const employee = employees.find((e) => e.id === params.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const assignmentId = `asg-${Date.now()}`;
    const newAssignment = {
      id: assignmentId,
      assetId: asset.id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeEmail: employee.email,
      department: employee.department,
      assignedById: params.assignedById,
      assignedByName: params.assignedByName,
      assignedDate: now,
      expectedReturnDate: params.expectedReturnDate,
      status: "ACTIVE",
      createdAt: now
    };
    asset.status = "ASSIGNED";
    asset.currentAssigneeId = employee.id;
    asset.currentAssigneeName = `${employee.firstName} ${employee.lastName}`;
    asset.currentAssignmentId = assignmentId;
    asset.updatedAt = now;
    const assignments = load(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    assignments.unshift(newAssignment);
    save(STORAGE_KEYS.ASSIGNMENTS, assignments);
    save(STORAGE_KEYS.ASSETS, assets);
    this.addActivityLog(
      "ASSIGN_ASSET",
      "ASSIGNMENT",
      assignmentId,
      `Issued ${asset.name} (${asset.assetTag}) to ${employee.firstName} ${employee.lastName}`
    );
    this.addNotification({
      title: "Asset Assigned",
      message: `${asset.name} (${asset.assetTag}) was successfully assigned to ${employee.firstName} ${employee.lastName}.`,
      type: "ASSET_RETURN",
      severity: "SUCCESS",
      link: `/assets/${asset.id}`
    });
    return newAssignment;
  }
  // Return Transaction
  static returnAsset(params) {
    const assets = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const assignments = load(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const asset = assets.find((a) => a.id === params.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }
    const activeAssignment = assignments.find((asg) => asg.assetId === asset.id && asg.status === "ACTIVE");
    if (!activeAssignment) {
      throw new Error("No active assignment record found for this asset.");
    }
    const returnTimestamp = params.returnedDate ? new Date(params.returnedDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
    activeAssignment.status = "RETURNED";
    activeAssignment.returnedDate = returnTimestamp;
    activeAssignment.returnCondition = params.returnCondition;
    activeAssignment.returnNotes = params.returnNotes || "";
    if (params.returnCondition === "DAMAGED" || params.returnCondition === "NEEDS_REPAIR" || params.returnToMaintenance) {
      asset.status = "UNDER_MAINTENANCE";
    } else {
      asset.status = "AVAILABLE";
    }
    const previousAssignee = asset.currentAssigneeName || "Employee";
    asset.currentAssigneeId = null;
    asset.currentAssigneeName = null;
    asset.currentAssignmentId = null;
    asset.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    save(STORAGE_KEYS.ASSIGNMENTS, assignments);
    save(STORAGE_KEYS.ASSETS, assets);
    this.addActivityLog(
      "RETURN_ASSET",
      "ASSIGNMENT",
      activeAssignment.id,
      `Processed return of ${asset.name} (${asset.assetTag}) from ${previousAssignee}. Condition: ${params.returnCondition}`
    );
    this.addNotification({
      title: "Asset Returned",
      message: `${asset.name} (${asset.assetTag}) returned by ${previousAssignee} in ${params.returnCondition} condition.`,
      type: "ASSET_RETURN",
      severity: params.returnCondition === "DAMAGED" ? "WARNING" : "INFO",
      link: `/assets/${asset.id}`
    });
    return activeAssignment;
  }
  // Equipment Replacement / Swap Transaction
  static replaceAsset(params) {
    const assets = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const oldAsset = assets.find((a) => a.id === params.oldAssetId);
    if (!oldAsset) throw new Error("Existing asset not found");
    const employeeId = oldAsset.currentAssigneeId;
    if (!employeeId) throw new Error("Existing asset has no assigned employee to replace for");
    const newAsset = assets.find((a) => a.id === params.newAssetId);
    if (!newAsset) throw new Error("Replacement asset not found");
    if (newAsset.status !== "AVAILABLE") {
      throw new Error(`Replacement asset is not available (currently ${newAsset.status})`);
    }
    const returnedAssignment = this.returnAsset({
      assetId: oldAsset.id,
      returnCondition: params.oldAssetCondition,
      returnNotes: `Replaced with ${newAsset.name} (${newAsset.assetTag}). Reason: ${params.reason}. ${params.oldAssetNotes || ""}`,
      returnToMaintenance: params.oldAssetCondition === "DAMAGED" || params.oldAssetCondition === "NEEDS_REPAIR"
    });
    const newAssignment = this.assignAsset({
      assetId: newAsset.id,
      employeeId,
      assignedById: params.assignedById,
      assignedByName: params.assignedByName,
      expectedReturnDate: params.expectedReturnDate,
      notes: `Issued as replacement for ${oldAsset.name} (${oldAsset.assetTag}). Reason: ${params.reason}`
    });
    this.addActivityLog(
      "REPLACE_ASSET",
      "ASSIGNMENT",
      newAssignment.id,
      `Swapped ${oldAsset.name} (${oldAsset.assetTag}) with ${newAsset.name} (${newAsset.assetTag}) for employee.`
    );
    this.addNotification({
      title: "Equipment Swapped / Replaced",
      message: `${oldAsset.name} was returned and replaced with ${newAsset.name} for ${newAssignment.employeeName}.`,
      type: "ASSET_RETURN",
      severity: "INFO",
      link: `/assets/${newAsset.id}`
    });
    return { returnedAssignment, newAssignment };
  }
  // Maintenance
  static getMaintenanceRecords(assetId) {
    const records = load(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    if (assetId) {
      return records.filter((r) => r.assetId === assetId);
    }
    return records;
  }
  static createMaintenanceRecord(record) {
    const assets = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const asset = assets.find((a) => a.id === record.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newRecord = {
      id: `mnt-${Date.now()}`,
      assetId: asset.id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      issueDescription: record.issueDescription,
      reportedDate: now,
      scheduledDate: record.scheduledDate || now.slice(0, 10),
      cost: Number(record.cost) || 0,
      serviceProvider: record.serviceProvider,
      technicianName: record.technicianName,
      status: "PENDING",
      createdAt: now
    };
    asset.status = "UNDER_MAINTENANCE";
    asset.updatedAt = now;
    const records = load(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    records.unshift(newRecord);
    save(STORAGE_KEYS.MAINTENANCE, records);
    save(STORAGE_KEYS.ASSETS, assets);
    this.addActivityLog("LOG_MAINTENANCE", "MAINTENANCE", newRecord.id, `Logged maintenance ticket for ${asset.name}`);
    return newRecord;
  }
  static updateMaintenanceStatus(id, status, resolutionNotes, completedCost) {
    const records = load(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    const idx = records.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("Maintenance record not found");
    const item = records[idx];
    item.status = status;
    if (resolutionNotes) item.resolutionNotes = resolutionNotes;
    if (completedCost !== void 0) item.cost = completedCost;
    if (status === "COMPLETED" || status === "CANCELLED") {
      item.completedDate = (/* @__PURE__ */ new Date()).toISOString();
      const assets = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
      const asset = assets.find((a) => a.id === item.assetId);
      if (asset && asset.status === "UNDER_MAINTENANCE") {
        asset.status = "AVAILABLE";
        asset.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        save(STORAGE_KEYS.ASSETS, assets);
      }
    }
    save(STORAGE_KEYS.MAINTENANCE, records);
    this.addActivityLog("UPDATE_MAINTENANCE", "MAINTENANCE", item.id, `Maintenance status updated to ${status}`);
    return item;
  }
  // Employees
  static getEmployees() {
    const employees = load(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    const assets = this.getAssets().assets;
    return employees.map((emp) => ({
      ...emp,
      assignedAssetCount: assets.filter((a) => a.currentAssigneeId === emp.id).length
    }));
  }
  static getEmployeeById(id) {
    const employees = this.getEmployees();
    const emp = employees.find((e) => e.id === id || e.employeeCode === id);
    if (!emp) return null;
    const { assets } = this.getAssets();
    const empAssets = assets.filter((a) => a.currentAssigneeId === emp.id);
    const assignments = this.getAssignments().filter((asg) => asg.employeeId === emp.id);
    return { employee: emp, assets: empAssets, history: assignments };
  }
  static saveEmployee(data) {
    const employees = load(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    let saved;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (data.id) {
      const idx = employees.findIndex((e) => e.id === data.id);
      if (idx >= 0) {
        employees[idx] = { ...employees[idx], ...data };
        saved = employees[idx];
      } else {
        throw new Error("Employee not found");
      }
    } else {
      saved = {
        id: `emp-${Date.now()}`,
        employeeCode: `EMP-0${employees.length + 101}`,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        department: data.department || "General",
        jobTitle: data.jobTitle || "Team Member",
        phone: data.phone || "",
        status: data.status || "ACTIVE",
        joinedDate: data.joinedDate || now.slice(0, 10),
        createdAt: now
      };
      employees.unshift(saved);
    }
    save(STORAGE_KEYS.EMPLOYEES, employees);
    this.addActivityLog("SAVE_EMPLOYEE", "EMPLOYEE", saved.id, `Saved employee profile for ${saved.firstName} ${saved.lastName}`);
    return saved;
  }
  // Assignments
  static getAssignments() {
    return load(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  }
  // Users
  static getUsers() {
    return load(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  static saveUser(user) {
    const users = load(STORAGE_KEYS.USERS, INITIAL_USERS);
    let saved;
    if (user.id) {
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
        saved = users[idx];
      } else {
        throw new Error("User not found");
      }
    } else {
      saved = {
        id: `usr-${Date.now()}`,
        email: user.email.toLowerCase().trim(),
        fullName: user.fullName.trim(),
        role: user.role || "EMPLOYEE",
        department: user.department || "General",
        active: user.active ?? true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      users.unshift(saved);
    }
    save(STORAGE_KEYS.USERS, users);
    this.addActivityLog("SAVE_USER", "USER", saved.id, `Updated user credentials for ${saved.fullName} (${saved.role})`);
    return saved;
  }
  // Current User / Auth
  static getCurrentUser() {
    return load(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[1]);
  }
  static setCurrentUser(user) {
    save(STORAGE_KEYS.CURRENT_USER, user);
  }
  // Notifications
  static getNotifications() {
    return load(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  static addNotification(item) {
    const list = this.getNotifications();
    const created = {
      ...item,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    list.unshift(created);
    save(STORAGE_KEYS.NOTIFICATIONS, list);
    return created;
  }
  static markNotificationRead(id) {
    const list = this.getNotifications();
    const target = list.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      save(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }
  static markAllNotificationsRead() {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    save(STORAGE_KEYS.NOTIFICATIONS, list);
  }
  // Activity Logs
  static getActivityLogs() {
    return load(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
  }
  static addActivityLog(action, entityType, entityId, details) {
    const currentUser = this.getCurrentUser();
    const logs = load(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    const newLog = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ipAddress: "127.0.0.1"
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.length = 200;
    save(STORAGE_KEYS.ACTIVITY_LOGS, logs);
  }
  // Dashboard Aggregates
  static getDashboardMetrics() {
    const { assets } = this.getAssets();
    const categories = this.getCategories();
    const assignments = this.getAssignments();
    const maintenance = this.getMaintenanceRecords();
    const activities = this.getActivityLogs();
    let totalValuation = 0;
    let availableCount = 0;
    let assignedCount = 0;
    let maintenanceCount = 0;
    let retiredCount = 0;
    let expiredWarranties = 0;
    let expiring30Days = 0;
    assets.forEach((a) => {
      totalValuation += a.purchaseCost || 0;
      if (a.status === "AVAILABLE") availableCount++;
      else if (a.status === "ASSIGNED") assignedCount++;
      else if (a.status === "UNDER_MAINTENANCE") maintenanceCount++;
      else if (a.status === "RETIRED") retiredCount++;
      const ws = getWarrantyStatus(a.warrantyExpiryDate).status;
      if (ws === "EXPIRED") expiredWarranties++;
      else if (ws === "EXPIRING_30") expiring30Days++;
    });
    const categoryBreakdown = categories.map((cat) => {
      const catAssets = assets.filter((a) => a.categoryId === cat.id);
      return {
        categoryName: cat.name,
        count: catAssets.length,
        value: catAssets.reduce((sum, item) => sum + (item.purchaseCost || 0), 0)
      };
    });
    const total = assets.length || 1;
    const statusBreakdown = [
      { status: "Available", count: availableCount, percentage: Math.round(availableCount / total * 100) },
      { status: "Assigned", count: assignedCount, percentage: Math.round(assignedCount / total * 100) },
      { status: "Maintenance", count: maintenanceCount, percentage: Math.round(maintenanceCount / total * 100) },
      { status: "Retired", count: retiredCount, percentage: Math.round(retiredCount / total * 100) }
    ];
    return {
      totalAssets: assets.length,
      availableAssets: availableCount,
      assignedAssets: assignedCount,
      maintenanceAssets: maintenanceCount,
      retiredAssets: retiredCount,
      totalValuation,
      expiredWarranties,
      expiringWarranties30Days: expiring30Days,
      pendingMaintenanceCount: maintenance.filter((m) => m.status === "PENDING" || m.status === "IN_PROGRESS").length,
      activeAssignmentsCount: assignments.filter((a) => a.status === "ACTIVE").length,
      categoryBreakdown,
      statusBreakdown,
      recentAssignments: assignments.slice(0, 5),
      recentActivity: activities.slice(0, 6)
    };
  }
  // Retire Asset
  static retireAsset(assetId, reason) {
    const assets = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) throw new Error("Asset not found");
    if (asset.status === "ASSIGNED") {
      throw new Error("Cannot retire an asset that is currently assigned. Return it first.");
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    asset.status = "RETIRED";
    asset.retiredAt = now;
    asset.retireReason = reason || "End of lifecycle";
    asset.updatedAt = now;
    save(STORAGE_KEYS.ASSETS, assets);
    this.addActivityLog(
      "RETIRE_ASSET",
      "ASSET",
      asset.id,
      `Retired asset ${asset.name} (${asset.assetTag}). Reason: ${asset.retireReason}`
    );
    this.addNotification({
      title: "Asset Retired",
      message: `${asset.name} (${asset.assetTag}) has been decommissioned from service.`,
      type: "ASSET_RETURN",
      severity: "INFO",
      link: `/assets/${asset.id}`
    });
    return asset;
  }
  // Permanently delete an asset (only allowed for RETIRED assets)
  static deleteAsset(assetId) {
    const assets = load(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const idx = assets.findIndex((a) => a.id === assetId);
    if (idx < 0) throw new Error("Asset not found");
    const asset = assets[idx];
    if (asset.status !== "RETIRED") {
      throw new Error("Only retired assets can be permanently deleted. Retire the asset first.");
    }
    assets.splice(idx, 1);
    save(STORAGE_KEYS.ASSETS, assets);
    this.addActivityLog(
      "DELETE_ASSET",
      "ASSET",
      assetId,
      `Permanently deleted retired asset ${asset.name} (${asset.assetTag}) from records.`
    );
  }
  // Reset to seed data
  static resetToDefaults() {
    save(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    save(STORAGE_KEYS.USERS, INITIAL_USERS);
    save(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    save(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    save(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    save(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    save(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    save(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    save(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[1]);
  }
}
export {
  StorageService
};
