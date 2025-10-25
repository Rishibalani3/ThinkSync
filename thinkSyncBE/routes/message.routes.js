import express from "express";
import {
  sendMessage,
  getMessages,
  getRecentChats,
  getUnreadCount,
  markMessagesRead,
} from "../controllers/message.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";

const messageRoutes = (io) => {
  const router = express.Router();

  router.post("/send", ensureAuth, sendMessage(io));

  router.get("/recent", ensureAuth, getRecentChats);
  router.get("/unread-count", ensureAuth, getUnreadCount);
  router.post("/:userId/mark-read", ensureAuth, markMessagesRead);
  router.get("/:userId", ensureAuth, getMessages);

  return router;
};

export default messageRoutes;
