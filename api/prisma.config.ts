import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.dev" });
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://" + process.env.POSTGRES_USER + ":" + process.env.POSTGRES_PASSWORD + "@" + (process.env.DB_HOST || "localhost") + ":" + (process.env.DB_PORT || "5432") + "/" + process.env.POSTGRES_DB + "?schema=public"
  }
});
