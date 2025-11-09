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

    console.log("Before req.login - user.id:", user.id);
    console.log("Before req.login - sessionID:", req.sessionID);
    console.log("Before req.login - session exists:", !!req.session);

    // Use req.login directly - it will handle session storage
    // Don't regenerate - let req.login use the existing session
    req.login(user, (err) => {
      if (err) {
        console.error("req.login error:", err);
        return next(err);
      }

      console.log("serializeUser should have been called by now");
      
      // Debug: Check if passport data is in session IMMEDIATELY after req.login
      console.log(
        "After req.login - session.passport:",
        JSON.stringify(req.session.passport)
      );
      console.log("After req.login - user.id:", user.id);
      console.log(
        "After req.login - session keys:",
        Object.keys(req.session)
      );
      console.log("After req.login - full session:", JSON.stringify(req.session, null, 2));

      // CRITICAL: Wait for session to be saved to database
      // The session.save() ensures data is persisted to PostgreSQL
      req.session.save((err) => {
        if (err) {
          console.error("Session save error in login:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }

        console.log("Session saved to database");
        
        // Debug: Verify passport data is still in session after save
        console.log(
          "After session.save - session.passport:",
          JSON.stringify(req.session.passport)
        );
        console.log(
          "After session.save - isAuthenticated:",
          req.isAuthenticated()
        );
        console.log(
          "After session.save - req.user:",
          req.user ? "present" : "missing"
        );
        console.log("After session.save - sessionID:", req.sessionID);

        // Return user object without sensitive fields
        const {
          password,
          googleAccessToken,
          googleRefreshToken,
          googleId,
          ...safeUser
        } = user;

        // Log session info for debugging
        console.log("Login successful - Session ID:", req.sessionID);
        console.log("Response being sent with user data");

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
          process.env.CORS_ORIGIN + "/login?error=session_save_failed"
        );
      }
      // Get the first origin if multiple are provided
      const frontendUrl = process.env.CORS_ORIGIN;
      res.redirect(frontendUrl);
    });
  }
);

export default router;
