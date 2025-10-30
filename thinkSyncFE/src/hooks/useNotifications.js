import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axios";
import io from "socket.io-client";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (e) {
      console.error("Error fetching notifications:", e.response?.data || e.message);
      setNotifications([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (socketRef.current) socketRef.current.disconnect();

    socketRef.current = io("http://localhost:3000", { withCredentials: true });
    socketRef.current.emit("registerUser", user.id);

    socketRef.current.on("newNotification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    fetchNotifications();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    await api.post(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, seen: true } : n)));
  };

  const markAllAsRead = async () => {
    await Promise.all(notifications.filter((n) => !n.seen).map((n) => api.post(`/notifications/${n.id}/read`)));
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