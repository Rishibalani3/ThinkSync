import { Router } from "express";
const router = Router();
import {
  fetchPostsByTopic,
  fetchTredingPosts,
  fetchTredingTopics,
} from "../controllers/topics.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";

router.get("/trending", ensureAuth, fetchTredingTopics);
router.get("/posts/:topicName", ensureAuth, fetchPostsByTopic);
router.get("/trending-posts", ensureAuth, fetchTredingPosts);

export default router;
