import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";

const router = express.Router();

router.post("/send", ensureAuth, sendMessage);

router.get("/:userId", ensureAuth, getMessages);

export default router;
