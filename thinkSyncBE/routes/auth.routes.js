import { Router } from "express";
import passport from "passport";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = Router();

// email signup/login
router.post("/signup", signup);
router.post("/login", passport.authenticate("local"), login);
router.post("/logout", logout);

// google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("http://localhost:5173/")
);

// facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => res.redirect("http://localhost:5173/dashboard")
);

export default router;
