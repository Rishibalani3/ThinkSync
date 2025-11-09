import { PrismaClient } from "@prisma/client";
import pkg from "pg";

const { Pool } = pkg;

// Prisma ORM instance
const prisma = new PrismaClient();

// Postgres connection pool for connect-pg-simple
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // ✅ required for Railway & most managed DBs
  },
});

export { prisma, pgPool };
