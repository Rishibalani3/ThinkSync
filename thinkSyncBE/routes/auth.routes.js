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

    req.logIn(user, (err) => {
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

router.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return res.redirect(
          console.log("Peforming redirect after Google OAuth login[no user]")(
            process.env.CORS_ORIGIN || "http://localhost:5173"
          ) + "/login?error=no_user"
        );

      // 🔥 serialize user into the session
      req.logIn(user, (err) => {
        if (err) return next(err);
        console.log("User logged in via Google OAuth:", user.id);
        // 🔥 save session to DB before redirecting
        req.session.save((saveErr) => {
          if (saveErr) {
            console.log("Session save error after Google login:", saveErr);
            console.error("Session save error after Google login:", saveErr);
            return res.redirect(
              console.log("Peforming redirect after Google OAuth login")(
                process.env.CORS_ORIGIN || "http://localhost:5173"
              ) + "/login?error=session_error"
            );
          }

          const frontendUrl =
            process.env.CORS_ORIGIN || "http://localhost:5173";
          return res.redirect(frontendUrl);
        });
      });
    }
  )(req, res, next);
});

export default router;
