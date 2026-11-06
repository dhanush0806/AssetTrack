import { createContext, useContext, useState, useEffect } from "react";
import { StorageService } from "../services/storageService";
const AuthContext = createContext(void 0);
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => StorageService.getCurrentUser());
  useEffect(() => {
    StorageService.setCurrentUser(currentUser);
  }, [currentUser]);
  const switchUserRole = (role) => {
    const users = StorageService.getUsers();
    const targetUser = users.find((u) => u.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@assettrack.com`,
      fullName: role === "ADMIN" ? "Eleanor Vance (Admin)" : role === "ASSET_MANAGER" ? "Marcus Sterling (Asset Manager)" : "Sophia Martinez (Employee)",
      role,
      department: role === "ADMIN" ? "IT Administration" : role === "ASSET_MANAGER" ? "Asset Operations" : "Software Engineering",
      active: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setCurrentUser(targetUser);
  };
  const login = (email) => {
    const users = StorageService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    if (email.includes("admin")) {
      switchUserRole("ADMIN");
      return true;
    }
    if (email.includes("employee")) {
      switchUserRole("EMPLOYEE");
      return true;
    }
    switchUserRole("ASSET_MANAGER");
    return true;
  };
  const logout = () => {
    const users = StorageService.getUsers();
    const admin = users[0];
    if (admin) setCurrentUser(admin);
  };
  const isAdmin = currentUser.role === "ADMIN";
  const isManager = currentUser.role === "ASSET_MANAGER" || isAdmin;
  const isEmployee = currentUser.role === "EMPLOYEE";
  return <AuthContext.Provider
    value={{
      currentUser,
      switchUserRole,
      login,
      logout,
      isAdmin,
      isManager,
      isEmployee
    }}
  >
      {children}
    </AuthContext.Provider>;
};
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export {
  AuthProvider,
  useAuth
};
