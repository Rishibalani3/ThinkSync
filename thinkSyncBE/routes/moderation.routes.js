import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
const router = Router();

import {
  createReport,
  getReports,
  resolveReport,
} from "../controllers/moderation.controller.js";

router.get("/report", ensureAuth, getReports);
router.post("/report/create", ensureAuth, createReport);
router.post("/report/resolve/:reportId", ensureAuth, resolveReport);

export default router;
