import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import sessionMiddleware from "./config/session.js";
import setupPassport from "./config/passport.js";

import likeRoutes from "./routes/like.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import followRoutes from "./routes/follower.routes.js";
import topicRoutes from "./routes/topics.routes.js";
import messageRoutes from "./routes/message.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";

import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

// Create Express app
const app = express();

// Create HTTP server for Socket.IO
const server = createServer(app);

// Socket.IO setup
// Setting here origin to allow requests from frontend
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

// Socket.IO middleware to share session
//handling the request made by frontend
io.on("connection", (socket) => {
  // console.log("New socket connected:", socket.id);

  // Join a chat room between two users
  socket.on("joinRoom", (roomId) => socket.join(roomId));

  // Send a message in real-time
  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

// ---------------------
// Middleware
// ---------------------
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());
setupPassport();

// Ensure session is saved after authentication
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
    });
  }
  next();
});

// ---------------------
// Routes
// ---------------------
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/likes", likeRoutes);
app.use("/bookmark", bookmarkRoutes);
app.use("/comment", commentRoutes);
app.use("/follower", followRoutes);
app.use("/topics", topicRoutes);
app.use("/messages", messageRoutes(io));
app.use("/moderation", moderationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    message: "Server is running",
    sessionSecret: process.env.SESSION_SECRET ? "Set" : "Not set",
    databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
  });
});

export { app, server };
