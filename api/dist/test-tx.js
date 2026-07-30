import { PrismaClient } from "../generated/prisma/index.js";
import { env } from "./config/env.js";

const prisma = new PrismaClient();
async function main() {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: "test_transaction_" + Date.now() + "@example.com",
        role: "USER"
      }
    });
    console.log("created", user.id);
    const updated = await tx.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0 }
    });
    console.log("updated", updated.id);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
