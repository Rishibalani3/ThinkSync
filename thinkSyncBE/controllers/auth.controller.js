import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "../config/db.js";
import { sendNotification } from "../utils/notification.js";
import { sendMailToUser } from "../utils/SendEmail.js";

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
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    const resetURL =
      process.env.CORS_ORIGIN +
      "/reset-password?token=" +
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

    //i will implement kafka queue here to stop sending mails directly from here
    //doing this here also put more pressure on the server
    await sendMailToUser({
      to: user.email,
      subject: "Password Reset Request from ThinkSync",
      html: `  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px; text-align: center;">
    <div style="max-width: 420px; margin: auto; background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb;">
      <img 
        src="https://res.cloudinary.com/dbwt5yere/image/upload/v1761888346/thinksync_rvcgpp.jpg" 
        alt="ThinkSync Logo" 
        style="width: 120px; margin-bottom: 16px;"
      />
      <h2 style="color: #111827; margin-bottom: 12px;">Reset Your Password</h2>
      <p style="color: #374151; font-size: 14px; margin-bottom: 24px;">
        Click the button below to set a new password. This link expires in 15 minutes.
      </p>
      <a href="${resetURL}" 
         style="background: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; display: inline-block;">
         Reset Password
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <p style="color: #9ca3af; font-size: 11px; margin-top: 16px;">
      © ${new Date().getFullYear()} ThinkSync
    </p>
  </div>`,
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
        expiresAt: { gt: new Date() },
        used: false,
      },
    });

    if (!resetRecord)
      return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user
      .update({
        where: { id },
        data: { password: hashedPassword },
      })
      .then(() => {
        sendNotification(
          {
            receiverId: id,
            content:
              "Your password has changed recently . If this wasn't you, please secure your account.",
            senderId: null,
            postId: null,
          },
          req.app.get("io"),
          req.app.get("userSocketMap")
        );
      })
      .then(async () => {
        await prisma.passwordResetToken.delete({
          where: { id: resetRecord.id },
        });
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

//for forgotting password
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
      res.clearCookie("thinksync.sid"); //session name
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
