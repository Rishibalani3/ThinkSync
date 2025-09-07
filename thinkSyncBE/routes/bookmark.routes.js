import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import { bookmarkPost } from "../controllers/bookmark.controller.js";

const router = Router();

router.post("/create/:postId", ensureAuth, bookmarkPost);

export default router;
