import { Router } from "express";
import passport from "passport";
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from "../controllers/auth.controller.js";
import forgotPasswordLimiter from "../utils/ForgotPasswordMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", passport.authenticate("local"), login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/validate-reset-token", validateResetToken);

// google
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    accessType: 'offline',
    prompt: 'consent' //it always asks for consent from user like you want to log in with google for this app.. 
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("http://localhost:5173/")
);

export default router;
