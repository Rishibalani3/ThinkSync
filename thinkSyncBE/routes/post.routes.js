import { Router } from "express";
import {
  createPost,
  deletePost,
  getFeed,
  getSinglePost,
  recordPostView,
  getPostStatistics,
} from "../controllers/post.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.get("/", getFeed);
router.get("/:postId", ensureAuth, getSinglePost);
router.get("/:postId/statistics", ensureAuth, getPostStatistics);
router.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 2 }]),
  ensureAuth,
  createPost
);
router.post("/delete/:postId", ensureAuth, deletePost);

//AI PART
router.route("/:postId/view").post(ensureAuth, recordPostView);

export default router;
