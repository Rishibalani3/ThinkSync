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

    // Regenerate session to ensure clean session for login
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regenerate error:", err);
        return next(err);
      }

      // Now login the user - this will store passport data in the new session
      req.login(user, (err) => {
        if (err) {
          console.error("req.login error:", err);
          return next(err);
        }

        // Debug: Check if passport data is in session
        console.log(
          "After req.login - session.passport:",
          req.session.passport
        );
        console.log("After req.login - user.id:", user.id);
        console.log(
          "After req.login - session keys:",
          Object.keys(req.session)
        );

        // Ensure session is saved before sending response
        req.session.save((err) => {
          if (err) {
            console.error("Session save error in login:", err);
            return res.status(500).json({ message: "Failed to save session" });
          }

          // Debug: Verify passport data is still in session after save
          console.log(
            "After session.save - session.passport:",
            req.session.passport
          );
          console.log(
            "After session.save - isAuthenticated:",
            req.isAuthenticated()
          );
          console.log(
            "After session.save - req.user:",
            req.user ? "present" : "missing"
          );

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

          return res.json({ user: safeUser });
        });
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
