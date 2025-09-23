import { Router } from "express";
import {
  createPost,
  deletePost,
  getFeed,
  getSinglePost,
  // getPost,
  // updatePost,
  // deletePost,
  // likePost,
  // bookmarkPost,
} from "../controllers/post.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

//functions should be implemented still in controller

router.get("/", getFeed);
router.get("/:postId", ensureAuth, getSinglePost);
router.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 2 }]),
  createPost
);
router.post("/delete/:postId", ensureAuth, deletePost);

export default router;
