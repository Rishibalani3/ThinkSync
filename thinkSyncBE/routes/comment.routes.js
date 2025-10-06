import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import {
  getComments,
  createComment,
  deleteComment,
  toggleCommentLike,
} from "../controllers/comment.controller.js";

const router = Router();

router.get("/:postId", ensureAuth, getComments);
router.post("/create", ensureAuth, createComment);
router.delete("/delete/:commentId", ensureAuth, deleteComment);
router.post("/like/:commentId", ensureAuth, toggleCommentLike);

export default router;
