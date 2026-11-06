import { createContext, useContext, useState, useEffect } from "react";
import { StorageService } from "../services/storageService";
const NotificationContext = createContext(void 0);
const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => StorageService.getNotifications());
  const refreshNotifications = () => {
    setNotifications(StorageService.getNotifications());
  };
  useEffect(() => {
    refreshNotifications();
  }, []);
  const markAsRead = (id) => {
    StorageService.markNotificationRead(id);
    refreshNotifications();
  };
  const markAllAsRead = () => {
    StorageService.markAllNotificationsRead();
    refreshNotifications();
  };
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return <NotificationContext.Provider
    value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications
    }}
  >
      {children}
    </NotificationContext.Provider>;
};
function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
export {
  NotificationProvider,
  useNotifications
};
