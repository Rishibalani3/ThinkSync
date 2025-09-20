import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "../config/db.js";

const signup = async (req, res) => {
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

const login = (req, res) => {
  res.json({ message: "Logged in", user: req.user });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      },
    });

    const resetURL =
      "http://localhost:5173/reset-password?token=" +
      resetToken +
      "&id=" +
      user.id;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      sender: "ThinkSync",

      subject: "Password Reset Request from thinkSync",
      html: `<body style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 40px; color: #333;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
    <tr>
      <td style="background: #4f46e5; padding: 20px; text-align: center; color: #fff; font-size: 24px; font-weight: bold;">
        ThinkSync
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <h2 style="margin: 0 0 15px; color: #111;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hey there 👋,<br><br>
          We received a request to reset your ThinkSync account password. If this was you, simply click the button below to set a new one.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" style="background: #4f46e5; color: #fff; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 8px; display: inline-block;">
            Reset My Password
          </a>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #666;">
          ⚠️ For your security, this link will expire in <strong>15 minutes</strong>.<br>
          If you didn't request a reset, you can safely ignore this email—your password will remain unchanged.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background: #f4f7fa; text-align: center; padding: 15px; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} ThinkSync. All rights reserved.
      </td>
    </tr>
  </table>
</body>
`,
    });

    res.status(200).json({
      message:
        "If your email exists, you will receive an email with instructions to reset your password",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  const { password, token, id } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: id,
        token: hashedToken,
        expiresAt: { gt: new Date() }, // Check if token is still valid
        used: false,
      },
    });

    if (!resetRecord)
      return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const validateResetToken = async (req, res) => {
  const { id, token } = req.query;

  if (!id || !token) {
    return res.status(400).json({ error: "Missing token or user ID" });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: id,
        token: hashedToken,
        expiresAt: { gt: new Date() }, // not expired
        used: false, // not used yet
      },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    return res.status(200).json({ message: "Token is valid" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
};

export {
  signup,
  login,
  forgotPassword,
  resetPassword,
  validateResetToken,
  logout,
};
