import { PrismaClient } from "@prisma/client";
import pkg from "pg";

const prisma = new PrismaClient();
const { Pool } = pkg;

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { prisma, pgPool };
