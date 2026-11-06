import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { AssetInventoryPage } from "../pages/AssetInventoryPage";
import { AssetFormPage } from "../pages/AssetFormPage";
import { AssetDetailsPage } from "../pages/AssetDetailsPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { EmployeeDirectoryPage } from "../pages/EmployeeDirectoryPage";
import { EmployeeDetailsPage } from "../pages/EmployeeDetailsPage";
import { AssignAssetPage } from "../pages/AssignAssetPage";
import { AssignmentHistoryPage } from "../pages/AssignmentHistoryPage";
import { ReturnAssetPage } from "../pages/ReturnAssetPage";
import { MaintenanceRecordsPage } from "../pages/MaintenanceRecordsPage";
import { WarrantyTrackingPage } from "../pages/WarrantyTrackingPage";
import { ReportsPage } from "../pages/ReportsPage";
import { UserManagementPage } from "../pages/UserManagementPage";
import { ProfileSettingsPage } from "../pages/ProfileSettingsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
const AppRoutes = () => {
  return <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {
    /* Public Auth Route */
  }
            <Route path="/login" element={<LoginPage />} />

            {
    /* Authenticated Dashboard Shell with All 17 Routes */
  }
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/assets" element={<AssetInventoryPage />} />
              <Route path="/assets/new" element={<AssetFormPage />} />
              <Route path="/assets/:id/edit" element={<AssetFormPage />} />
              <Route path="/assets/:id" element={<AssetDetailsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/employees" element={<EmployeeDirectoryPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
              <Route path="/assign" element={<AssignAssetPage />} />
              <Route path="/assignments/history" element={<AssignmentHistoryPage />} />
              <Route path="/returns" element={<ReturnAssetPage />} />
              <Route path="/maintenance" element={<MaintenanceRecordsPage />} />
              <Route path="/warranties" element={<WarrantyTrackingPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/settings" element={<ProfileSettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>;
};
export {
  AppRoutes
};
