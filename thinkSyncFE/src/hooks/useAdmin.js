import { useCallback } from "react";
import api from "../utils/axios";

const useAdmin = () => {
  // Dashboard Stats
  const getDashboardStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/dashboard/stats");
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      throw err;
    }
  }, []);

  // Reports
  const getReports = useCallback(async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const res = await api.get(`/admin/reports?${queryParams}`);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to fetch reports", err);
      throw err;
    }
  }, []);

  const resolveReport = useCallback(async (reportId, action, note) => {
    try {
      const res = await api.post(`/admin/reports/${reportId}/resolve`, {
        action,
        note,
      });
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to resolve report", err);
      throw err;
    }
  }, []);

  // Users
  const getUsers = useCallback(async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const res = await api.get(`/admin/users?${queryParams}`);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to fetch users", err);
      throw err;
    }
  }, []);

  const manageUser = useCallback(async (userId, action, reason, durationDays) => {
    try {
      const res = await api.post(`/admin/users/${userId}/manage`, {
        action,
        reason,
        durationDays,
      });
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to manage user", err);
      throw err;
    }
  }, []);

  // Audit Logs
  const getAuditLogs = useCallback(async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const res = await api.get(`/admin/audit-logs?${queryParams}`);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
      throw err;
    }
  }, []);

  // Announcements
  const getAnnouncements = useCallback(async (isActive) => {
    try {
      const queryParams = isActive !== undefined ? `?isActive=${isActive}` : "";
      const res = await api.get(`/admin/announcements${queryParams}`);
      return res.data.data || [];
    } catch (err) {
      console.error("Failed to fetch announcements", err);
      throw err;
    }
  }, []);

  const createAnnouncement = useCallback(async (data) => {
    try {
      const res = await api.post("/admin/announcements", data);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to create announcement", err);
      throw err;
    }
  }, []);

  const updateAnnouncement = useCallback(async (id, data) => {
    try {
      const res = await api.put(`/admin/announcements/${id}`, data);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to update announcement", err);
      throw err;
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id) => {
    try {
      const res = await api.delete(`/admin/announcements/${id}`);
      return res.data || null;
    } catch (err) {
      console.error("Failed to delete announcement", err);
      throw err;
    }
  }, []);

  // Guidelines
  const getGuidelines = useCallback(async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const res = await api.get(`/admin/guidelines?${queryParams}`);
      return res.data.data || [];
    } catch (err) {
      console.error("Failed to fetch guidelines", err);
      throw err;
    }
  }, []);

  const createGuideline = useCallback(async (data) => {
    try {
      const res = await api.post("/admin/guidelines", data);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to create guideline", err);
      throw err;
    }
  }, []);

  const updateGuideline = useCallback(async (id, data) => {
    try {
      const res = await api.put(`/admin/guidelines/${id}`, data);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to update guideline", err);
      throw err;
    }
  }, []);

  const deleteGuideline = useCallback(async (id) => {
    try {
      const res = await api.delete(`/admin/guidelines/${id}`);
      return res.data || null;
    } catch (err) {
      console.error("Failed to delete guideline", err);
      throw err;
    }
  }, []);

  // Static Content
  const getStaticContent = useCallback(async (key) => {
    try {
      const queryParams = key ? `?key=${key}` : "";
      const res = await api.get(`/admin/static-content${queryParams}`);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to fetch static content", err);
      throw err;
    }
  }, []);

  const upsertStaticContent = useCallback(async (data) => {
    try {
      const res = await api.post("/admin/static-content", data);
      return res.data.data || null;
    } catch (err) {
      console.error("Failed to save static content", err);
      throw err;
    }
  }, []);

  const deleteStaticContent = useCallback(async (key) => {
    try {
      const res = await api.delete(`/admin/static-content/${key}`);
      return res.data || null;
    } catch (err) {
      console.error("Failed to delete static content", err);
      throw err;
    }
  }, []);

  return {
    getDashboardStats,
    getReports,
    resolveReport,
    getUsers,
    manageUser,
    getAuditLogs,
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getGuidelines,
    createGuideline,
    updateGuideline,
    deleteGuideline,
    getStaticContent,
    upsertStaticContent,
    deleteStaticContent,
  };
};

export default useAdmin;

