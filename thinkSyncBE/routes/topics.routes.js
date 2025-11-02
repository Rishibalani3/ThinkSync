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

router.get("/trending", ensureAuth, fetchTredingTopics);
router.get("/posts/:topicName", ensureAuth, fetchPostsByTopic);
router.get("/trending-posts", ensureAuth, fetchTredingPosts);

router.get("/", getTopics);
router.post("/", updateUserTopics);
router.get("/:userId", getUserTopics);

export default router;
