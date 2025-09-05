import { Router } from "express";
import {
  createPost,
  deletePost,
  // getPosts,
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

// router.get("/", ensureAuth, getPosts);
// router.get("/:id", ensureAuth, getPost);
router.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 2 }]),
  createPost
);
// router.post("/update/:id", ensureAuth, updatePost);
router.post("/delete/:postId", ensureAuth, deletePost);
// router.post("/like/:id", ensureAuth, likePost);
// router.post("/bookmark/:id", ensureAuth, bookmarkPost);

export default router;
