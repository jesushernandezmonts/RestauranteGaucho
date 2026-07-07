// Prisma v7 stores generated code in .prisma/client subdirectory
import { PrismaClient } from "@prisma/client/.prisma/client/index.js";
export { PrismaClient };

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // DATABASE_URL = "file:./dev.db" → resolves to root dev.db
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
  let dbPath = dbUrl.replace("file:", "").trim();
  if (!path.isAbsolute(dbPath)) {
    dbPath = path.resolve(process.cwd(), dbPath);
  }
  
  const connection = new Database(dbPath);
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
