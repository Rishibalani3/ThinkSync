import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axios";
import { io } from "socket.io-client";
import { log } from "../utils/Logger.js";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Fetch notifications once or on demand
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (e) {
      console.error(
        "Error fetching notifications:",
        e.response?.data || e.message
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Disconnect any existing socket
    if (socketRef.current) socketRef.current.disconnect();

    // Create new socket with fallback to polling
    const backendUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
    socketRef.current = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"], // Allow fallback to polling
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Wait until connected, then register user
    socketRef.current.on("connect", () => {
      log("✅ Socket connected (Notifications):", socketRef.current.id);
      socketRef.current.emit("registerUser", user.id);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("❌ Socket connection error (Notifications):", error);
    });

    socketRef.current.on("newNotification", (notif) => {
      log("🔔 New notification:", notif);
      setNotifications((prev) => [notif, ...prev]);
    });

    socketRef.current.on("disconnect", (reason) => {
      log("🔌 Socket disconnected (Notifications):", reason);
    });

    socketRef.current.on("error", (error) => {
      console.error("❌ Socket error (Notifications):", error);
    });

    fetchNotifications();

    // Cleanup
    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    await api.post(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, seen: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await Promise.all(
      notifications
        .filter((n) => !n.seen)
        .map((n) => api.post(`/notifications/${n.id}/read`))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
  };

  const deleteNotification = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unread = notifications.filter((n) => !n.seen);
  const unreadCount = unread.length;
  const latestUnread = unread.slice(0, 3);

  return {
    notifications,
    setNotifications,
    unreadCount,
    latestUnread,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
}

export default useNotifications;
