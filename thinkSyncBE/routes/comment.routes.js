import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import {
  createComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.post("/create", ensureAuth, createComment);
router.delete("/delete/:commentId", ensureAuth, deleteComment);

export default router;
