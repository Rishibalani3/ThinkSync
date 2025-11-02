import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import { ensureAdmin } from "../middleware/ensureAdmin.middleware.js";
import {
  getDashboardStats,
  getReports,
  resolveReport,
  getUsers,
  manageUser,
} from "../controllers/admin.controller.js";
import {
  getAuditLogs,
} from "../controllers/admin.audit.controller.js";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/admin.announcements.controller.js";
import {
  getGuidelines,
  createGuideline,
  updateGuideline,
  deleteGuideline,
} from "../controllers/admin.guidelines.controller.js";
import {
  getStaticContent,
  upsertStaticContent,
  deleteStaticContent,
} from "../controllers/admin.content.controller.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(ensureAuth);
router.use(ensureAdmin);

// Dashboard & Analytics
router.get("/dashboard/stats", getDashboardStats);

// Reports & Moderation
router.get("/reports", getReports);
router.post("/reports/:reportId/resolve", resolveReport);

// User Management
router.get("/users", getUsers);
router.post("/users/:userId/manage", manageUser);

// Audit Logs
router.get("/audit-logs", getAuditLogs);

// Announcements
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.put("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

// Community Guidelines
router.get("/guidelines", getGuidelines);
router.post("/guidelines", createGuideline);
router.put("/guidelines/:id", updateGuideline);
router.delete("/guidelines/:id", deleteGuideline);

// Static Content
router.get("/static-content", getStaticContent);
router.post("/static-content", upsertStaticContent);
router.put("/static-content/:key", upsertStaticContent);
router.delete("/static-content/:key", deleteStaticContent);

export default router;
