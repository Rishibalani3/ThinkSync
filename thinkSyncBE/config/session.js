import session from "express-session";
import pgSession from "connect-pg-simple";
import { pgPool } from "./db.js";

const PgSession = pgSession(session);
const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    tableName: "user_sessions",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "fallback-secret-key",
  resave: false,
  saveUninitialized: false, // railway requires this to be false
  rolling: true,
  name: "thinksync.sid",
  cookie: {
    httpOnly: true,
    secure: isProduction, // true on Railway (uses HTTPS)
    sameSite: isProduction ? "none" : "lax", // allow cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

export default sessionMiddleware;
