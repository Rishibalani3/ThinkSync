import { Router } from "express";
import { me } from "../controllers/user.controller.js";
import { ensureAuth } from "../middleware/ensureAuth.middleware.js";
const router = Router();

// Test route to check if middleware is working
router.get("/test", ensureAuth, (req, res) => {
  res.json({ message: "Middleware is working!", user: req.user });
});

router.get("/me", ensureAuth, me);

export default router;
