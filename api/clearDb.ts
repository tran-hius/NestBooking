import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
  await prisma.destination.deleteMany({});
  console.log('Deleted all destinations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
