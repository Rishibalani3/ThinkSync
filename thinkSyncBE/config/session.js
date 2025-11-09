import session from "express-session";
import pgSession from "connect-pg-simple";
import { pgPool } from "./db.js";

const PgSession = pgSession(session);

const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    tableName: "user_sessions",
    createTableIfMissing: true, //if there will be no table for user_session it will create itself
  }),
  secret: process.env.SESSION_SECRET || "fallback-secret-key",
  resave: false,
  saveUninitialized: true, // Changed back to true - needed for session to be created before authentication
  rolling: true,
  name: 'thinksync.sid', // Session name - must be outside cookie config
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIE === "true", // Must be true when sameSite is "none"
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-site in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days 
    path: "/", // Ensure cookie is sent with all requests
    // Don't set domain - let browser handle it for cross-site cookies
  },
});

export default sessionMiddleware;
