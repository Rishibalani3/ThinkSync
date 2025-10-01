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
  saveUninitialized: true, 
  rolling: true,
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', // for the production (deployment)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days 
    name: 'thinksync.sid' //Session name
  },
});

export default sessionMiddleware;
