import { env } from "@/config/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});

export type TxClient = Omit<
PrismaClient,
"$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
