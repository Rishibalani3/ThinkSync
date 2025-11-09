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

/* ---------------- LOCAL AUTH ---------------- */

router.post("/signup", signup);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: info?.message || "Unauthorized" });

    // 🔥 Persist login to session
    req.login(user, (err) => {
      if (err) return next(err);

      req.session.save((err) => {
        if (err)
          return res.status(500).json({ message: "Failed to save session" });

        const {
          password,
          googleAccessToken,
          googleRefreshToken,
          googleId,
          ...safeUser
        } = user;

        return res.json({ user: safeUser });
      });
    });
  })(req, res, next);
});

router.post("/logout", logout);

/* ---------------- PASSWORD RESET ---------------- */

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/validate-reset-token", validateResetToken);

/* ---------------- GOOGLE OAUTH ---------------- */

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res, next) => {
    req.login(req.user, (err) => {
      if (err) {
        console.error("Google login serialization error:", err);
        return res.redirect(
          process.env.CORS_ORIGIN + "/login?error=session_error"
        );
      }

      // Save session after login
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect(
            process.env.CORS_ORIGIN + "/login?error=session_error"
          );
        }

        // Redirect to frontend after fully serialized
        const frontendUrl = process.env.CORS_ORIGIN;
        res.redirect(frontendUrl);
      });
    });
  }
);

export default router;
