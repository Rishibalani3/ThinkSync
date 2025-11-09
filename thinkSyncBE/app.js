import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import sessionMiddleware from "./config/session.js";
import setupPassport from "./config/passport.js";
import axios from "axios";
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
import notificationRoutes from "./routes/notification.routes.js";
import aiRecommendationRoutes from "./routes/aiRecommendation.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";

import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

// Create Express app
const app = express();

// Trust proxy - required for Railway and other hosting platforms behind a proxy
// This ensures req.protocol and req.secure are correctly set for HTTPS
app.set("trust proxy", 1);

// Create HTTP server for Socket.IO
const server = createServer(app);

// Socket.IO setup
// Setting here origin to allow requests from frontend
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// ---- USER-SOCKETID MAPPING ----
const userSocketMap = {}; // userId: socketId

io.on("connection", (socket) => {
  socket.on("registerUser", (userId) => {
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
  });

  socket.on("disconnect", () => {
    if (socket.userId && userSocketMap[socket.userId] === socket.id) {
      delete userSocketMap[socket.userId];
    }
  });

  // Join a chat room between two users
  socket.on("joinRoom", (roomId) => socket.join(roomId));

  // Send a message in real-time
  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", message);
  });
});

// ---------------------
// Middleware
// ---------------------
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(cookieParser());
app.use(sessionMiddleware);

// Middleware to add Partitioned attribute to session cookie for cross-site cookies
// This is required for modern browsers (Chrome 127+, Firefox) when using third-party cookies
app.use((req, res, next) => {
  // Only modify cookie in production (cross-site scenario)
  if (process.env.NODE_ENV === "production") {
    // Intercept the writeHead and end methods to modify Set-Cookie headers
    const originalWriteHead = res.writeHead.bind(res);
    const originalEnd = res.end.bind(res);
    const originalSetHeader = res.setHeader.bind(res);

    // Override setHeader to add Partitioned to session cookie
    res.setHeader = function (name, value) {
      if (name.toLowerCase() === "set-cookie") {
        const cookies = Array.isArray(value) ? value : [value];
        value = cookies.map((cookie) => {
          if (
            cookie.includes("thinksync.sid") &&
            !cookie.includes("Partitioned")
          ) {
            // Add Partitioned attribute before any existing attributes
            return cookie + "; Partitioned";
          }
          return cookie;
        });
      }
      return originalSetHeader(name, value);
    };

    // Also intercept writeHead to modify headers
    res.writeHead = function (statusCode, statusMessage, headers) {
      if (headers && headers["set-cookie"]) {
        const cookies = Array.isArray(headers["set-cookie"])
          ? headers["set-cookie"]
          : [headers["set-cookie"]];
        headers["set-cookie"] = cookies.map((cookie) => {
          if (
            cookie.includes("thinksync.sid") &&
            !cookie.includes("Partitioned")
          ) {
            return cookie + "; Partitioned";
          }
          return cookie;
        });
      }
      return originalWriteHead(statusCode, statusMessage, headers);
    };
  }
  next();
});

// CRITICAL: setupPassport() must be called BEFORE passport.session()
// This registers serializeUser and deserializeUser functions
setupPassport();

app.use(passport.initialize());
app.use(passport.session());

// Ensure session is saved after authentication
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
    });
  }
  next();
});

// for proxying images to avoid CORS issues
app.get("/proxy", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const decodedUrl = decodeURIComponent(url);
    const response = await axios.get(decodedUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "windows-1252''Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });

    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).send("Failed to load image");
  }
});

// ---------------------
// Routes
// ---------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/bookmark", bookmarkRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/follower", followRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/messages", messageRoutes(io));
app.use("/api/v1/moderation", moderationRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/ai", aiRecommendationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/announcements", announcementRoutes);

app.get("/health", (req, res) => {
  res.json({
    message: "Server is running",
    sessionSecret: process.env.SESSION_SECRET ? "Set" : "Not set",
    databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
    corsOrigin: process.env.CORS_ORIGIN || "Not set",
    nodeEnv: process.env.NODE_ENV || "Not set",
    protocol: req.protocol,
    secure: req.secure,
  });
});

// Session test endpoint (for debugging)
app.get("/api/v1/test-session", (req, res) => {
  req.session.test = "Session is working";
  req.session.save((err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Session save failed", details: err.message });
    }

    // Get Set-Cookie header to verify Partitioned attribute
    const setCookieHeaders = res.getHeader("set-cookie") || [];

    res.json({
      sessionId: req.sessionID,
      session: req.session,
      sessionPassport: req.session.passport,
      cookies: req.cookies,
      protocol: req.protocol,
      secure: req.secure,
      nodeEnv: process.env.NODE_ENV,
      isAuthenticated: req.isAuthenticated(),
      user: req.user ? "present" : "missing",
      setCookieHeaders: Array.isArray(setCookieHeaders)
        ? setCookieHeaders
        : [setCookieHeaders],
      headers: {
        origin: req.headers.origin,
        referer: req.headers.referer,
        cookie: req.headers.cookie,
      },
    });
  });
});

// Check session in database directly
app.get("/api/v1/check-db-session", async (req, res) => {
  try {
    const { pgPool } = await import("./config/db.js");
    const sessionId = req.sessionID;
    
    const result = await pgPool.query(
      'SELECT * FROM user_sessions WHERE sid = $1',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ 
        found: false, 
        sessionId,
        message: "Session not found in database" 
      });
    }
    
    const sessionData = result.rows[0];
    let sessData = null;
    try {
      sessData = typeof sessionData.sess === 'string' 
        ? JSON.parse(sessionData.sess) 
        : sessionData.sess;
    } catch (e) {
      sessData = sessionData.sess;
    }
    
    res.json({
      found: true,
      sessionId,
      sessionData: {
        sid: sessionData.sid,
        expire: sessionData.expire,
        sess: sessData,
        passport: sessData?.passport,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

export { app, server, io, userSocketMap };
