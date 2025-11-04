import { Router } from "express";
import { getActiveAnnouncements } from "../controllers/announcement.controller.js";

const router = Router();

// Public route - no authentication required
router.get("/active", getActiveAnnouncements);

export default router;

