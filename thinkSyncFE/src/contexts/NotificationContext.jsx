
import { createContext, useContext } from "react";
import useNotificationsHook from "../hooks/useNotifications";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const notifications = useNotificationsHook();
  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
