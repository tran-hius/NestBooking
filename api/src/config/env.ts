import dotenv from "dotenv";
import ms from "ms";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

// Lấy thông tin DB từ file env, cài sẵn giá trị mặc định để chống sập
const DB_USER = process.env.POSTGRES_USER || "postgres";
const DB_PASS = process.env.POSTGRES_PASSWORD;
if (!DB_PASS) {
  throw new Error("Missing POSTGRES_PASSWORD in environment variables");
}
const DB_NAME = process.env.POSTGRES_DB || "booking";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "5433"; 
const CONSTRUCTED_DATABASE_URL = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public`;

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",

  PORT: Number(process.env.PORT) || 8080,

  DATABASE_URL: process.env.DATABASE_URL || CONSTRUCTED_DATABASE_URL,

  REDIS_HOST: process.env.REDIS_HOST ?? "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,

  RABBITMQ_URL: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",

  OTP_TTL: Number(process.env.OTP_TTL) || 300,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30m",
  JWT_EXPIRES_IN_MS: ms(process.env.JWT_EXPIRES_IN as ms.StringValue || "30m"),

  COOKIE_SECRET: process.env.COOKIE_SECRET || "default_cookie_secret_change_me_in_prod",

  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD!,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};