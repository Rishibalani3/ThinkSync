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
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: info.message || "Unauthorized" });

    req.login(user, (err) => {
      if (err) return next(err);
      
      // Ensure session is saved before sending response
      // req.login() stores user.id in session, which triggers session creation
      req.session.save((err) => {
        if (err) {
          console.error("Session save error in login:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        
        // Return user object without sensitive fields
        const {
          password,
          googleAccessToken,
          googleRefreshToken,
          googleId,
          ...safeUser
        } = user;
        
        // Log session info for debugging (remove in production)
        console.log("Login successful - Session ID:", req.sessionID);
        console.log("Session cookie will be set by express-session");
        
        return res.json({ user: safeUser });
      });
    });
  })(req, res, next);
});

router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/validate-reset-token", validateResetToken);

// google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent", //it always asks for consent from user like you want to log in with google for this app..
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Ensure session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Session save error in OAuth callback:", err);
        return res.redirect(
          (process.env.CORS_ORIGIN?.split(',')[0]?.trim() || "http://localhost:5173") + "/login?error=session_error"
        );
      }
      // Get the first origin if multiple are provided
      const frontendUrl = process.env.CORS_ORIGIN?.split(',')[0]?.trim() || "http://localhost:5173";
      res.redirect(frontendUrl);
    });
  }
);

export default router;
