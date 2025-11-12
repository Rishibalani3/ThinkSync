import { Router } from "express";
const router = Router();
import {
  fetchPostsByTopic,
  fetchTredingPosts,
  fetchTredingTopics,
  updateUserTopics,
  getTopics,
  getUserTopics,
} from "../controllers/topics.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";

router.get("/trending", fetchTredingTopics);
router.get("/posts/:topicName", ensureAuth, fetchPostsByTopic);
router.get("/trending-posts", fetchTredingPosts);

router.get("/", getTopics);
router.post("/", updateUserTopics);
router.get("/:userId", getUserTopics);

export default router;
