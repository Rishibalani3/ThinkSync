import { Router } from "express";
import {
  getFollowers,
  followUser,
} from "../controllers/follower.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
const router = Router();

router.get("/", ensureAuth, getFollowers);
router.post("/follow/:userId", ensureAuth, followUser);

export default router;
