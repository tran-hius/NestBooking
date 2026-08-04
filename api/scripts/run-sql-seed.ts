import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../src/config/prisma";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSqlSeed() {
  console.log("🚀 Running NestBooking SQL Seed Script...");
  try {
    const sqlFilePath = path.join(__dirname, "../prisma/seed.sql");
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

    // Execute raw SQL script
    console.log("Executing raw SQL queries from prisma/seed.sql...");
    await prisma.$executeRawUnsafe(sqlContent);

    console.log("✅ SQL Seed executed successfully into PostgreSQL!");
  } catch (error) {
    console.error("❌ Error executing SQL seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSqlSeed();
