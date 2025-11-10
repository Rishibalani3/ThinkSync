import { PrismaClient } from "@prisma/client";
import pkg from "pg";

const { Pool } = pkg;

const prisma = new PrismaClient();

const isProduction = process.env.NODE_ENV === "production";

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ...(isProduction && {
    ssl: { rejectUnauthorized: false },
  }),
};

const pgPool = new Pool(poolConfig);

export { prisma, pgPool };
