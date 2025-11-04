import { Router } from "express";
import {
  getFollowers,
  followUser,
  getFollowing,
  getUserFollowers,
  getUserFollowing,
} from "../controllers/follower.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
const router = Router();

router.get("/followers", ensureAuth, getFollowers);
router.get("/following", ensureAuth, getFollowing);
router.get("/:userId/followers", ensureAuth, getUserFollowers);
router.get("/:userId/following", ensureAuth, getUserFollowing);
router.post("/follow/:userId", ensureAuth, followUser);

export default router;
