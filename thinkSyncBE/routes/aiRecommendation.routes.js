import { Router } from "express";
const router = Router();
import {
  getRecommendedTopics,
  getRecommendedUsers,
  getAITrendingTopics,
  getAITrendingPosts,
} from "../controllers/aiRecommendation.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";

// AI Recommendation Routes
router.get("/topics/recommended", ensureAuth, getRecommendedTopics);
router.get("/users/recommended", ensureAuth, getRecommendedUsers);
router.get("/topics/trending", getAITrendingTopics);
router.get("/posts/trending", ensureAuth, getAITrendingPosts);

export default router;

