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
  saveUninitialized: true,
  rolling: true,
  name: "thinksync.sid",
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  },
});

export default sessionMiddleware;
