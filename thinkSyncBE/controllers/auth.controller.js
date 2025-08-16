import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, password: hash },
  });

  res.status(201).json({ message: "User created", user });
};

export const login = (req, res) => {
  res.json({ message: "Logged in", user: req.user });
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
};
