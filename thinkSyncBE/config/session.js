import session from "express-session";
import pgSession from "connect-pg-simple";
import { pgPool } from "./db.js";

const PgSession = pgSession(session);

const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    tableName: "user_sessions",
  }),
  secret: process.env.SESSION_SECRET || "fallback-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    secure: false, 
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
});

export default sessionMiddleware;
