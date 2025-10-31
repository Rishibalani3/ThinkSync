import { Router } from "express";
import {
  createPost,
  deletePost,
  getFeed,
  getSinglePost,
  recordPostView,
} from "../controllers/post.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.get("/", getFeed);
router.get("/:postId", ensureAuth, getSinglePost);
router.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 2 }]),
  createPost
);
router.post("/delete/:postId", ensureAuth, deletePost);

//AI PART
router.route("/:postId/view").post(ensureAuth, recordPostView);

export default router;
