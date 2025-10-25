import { Router } from "express";
import {
  getFollowers,
  followUser,
  getFollowing
} from "../controllers/follower.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
const router = Router();

router.get("/", ensureAuth, getFollowers);
router.get("/following", ensureAuth, getFollowing);
router.post("/follow/:userId", ensureAuth, followUser);

export default router;
