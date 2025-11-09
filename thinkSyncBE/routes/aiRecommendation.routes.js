import { Router } from "express";
const router = Router();
import {
  getRecommendedTopics,
  getRecommendedUsers,
  getAITrendingTopics,
  getAITrendingPosts,
} from "../controllers/aiRecommendation.controller.js";
// AI Recommendation Routes
router.get("/topics/recommended", getRecommendedTopics);
router.get("/users/recommended", getRecommendedUsers);
router.get("/topics/trending", getAITrendingTopics);
router.get("/posts/trending", getAITrendingPosts);

export default router;
