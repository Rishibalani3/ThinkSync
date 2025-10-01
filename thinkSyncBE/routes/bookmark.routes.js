import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import {
  bookmarkPost,
  getBookmarks,
} from "../controllers/bookmark.controller.js";

const router = Router();

router.get("/", ensureAuth, getBookmarks);
router.post("/create/:postId", ensureAuth, bookmarkPost);

export default router;
