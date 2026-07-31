import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: [".env.dev", path.resolve(process.cwd(), "../.env")],
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://" +
        process.env.POSTGRES_USER +
        ":" +
        process.env.POSTGRES_PASSWORD +
        "@" +
        (process.env.DB_HOST || "localhost") +
        ":" +
        (process.env.DB_PORT || "5433") +
        "/" +
        process.env.POSTGRES_DB +
        "?schema=public",
  }
});
