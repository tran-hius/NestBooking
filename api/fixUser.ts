
import { PrismaClient, Role } from './generated/prisma/index.js';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'local28c@gmail.com' },
    update: { 
      role: Role.ADMIN,
      passwordHash: '$2b$10$pUYmbwzAdfkA9l0kZd8B..LfjeElz.1Pb5q.nQWXFE1TXN.F/ugNa'
    },
    create: {
      email: 'local28c@gmail.com',
      role: Role.ADMIN,
      passwordHash: '$2b$10$pUYmbwzAdfkA9l0kZd8B..LfjeElz.1Pb5q.nQWXFE1TXN.F/ugNa',
      profile: {
        create: {
          fullName: 'Admin User'
        }
      }
    }
  });
  console.log('User updated:', user);
}
main().finally(() => prisma.$disconnect());

