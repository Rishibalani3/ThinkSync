import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import { likePost } from "../controllers/like.controller.js";
const router = Router();

router.post("/like/:postId", ensureAuth, likePost);

export default router;
