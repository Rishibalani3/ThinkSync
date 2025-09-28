import { Router } from "express";
import {
  me,
  updateDetails,
  getUserPosts,
  getProfile,
} from "../controllers/user.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
const router = Router();

router.get("/test", ensureAuth, (req, res) => {
  res.json({ message: "Middleware is working!", user: req.user });
});

router.patch("/update", ensureAuth, updateDetails);
router.get("/me", ensureAuth, me);
router.get("/:userId/posts", ensureAuth, getUserPosts);
router.get("/profile", ensureAuth, getProfile); // Current user's profile
router.get("/profile/:username", ensureAuth, getProfile); // Other user's profile
export default router;
