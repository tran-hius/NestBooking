import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",

  PORT: Number(process.env.PORT) || 8080,

  DATABASE_URL: process.env.DATABASE_URL!,

  REDIS_HOST: process.env.REDIS_HOST ?? "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,

  RABBITMQ_URL: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",

  OTP_TTL: Number(process.env.OTP_TTL) || 300,

  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD!,
};