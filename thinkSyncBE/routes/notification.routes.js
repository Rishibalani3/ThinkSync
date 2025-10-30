import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import { getNotifications, markNotificationRead,deleteNotification } from "../controllers/notification.controller.js";

const router = Router();

router.get("/", ensureAuth, getNotifications);
router.post("/:id/read", ensureAuth, markNotificationRead);
router.delete("/:id", ensureAuth, deleteNotification);

export default router;