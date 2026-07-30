import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();
async function testFlow() {
    const email = "test_flow_" + Date.now() + "@example.com";
    await prisma.$transaction(async (tx) => {
        // 1. Create user
        const createdUser = await tx.user.create({
            data: {
                email: email,
                role: "USER",
                status: "ACTIVE",
                profile: {
                    create: {
                        fullName: "Test User"
                    }
                }
            },
            include: { profile: true }
        });
        console.log("Created user ID:", createdUser.id);
        // 2. Update user (simulate resetLoginAttempts)
        const updated = await tx.user.update({
            where: { id: createdUser.id },
            data: {
                loginAttempts: 0,
                lockUntil: null
            }
        });
        console.log("Updated user ID:", updated.id);
    });
}
testFlow()
    .then(() => console.log("Success"))
    .catch(e => console.error("Error:", e))
    .finally(() => prisma.$disconnect());
