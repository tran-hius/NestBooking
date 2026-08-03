import { prisma } from './src/config/prisma';

async function main() {
  const hotels = await prisma.hotel.findMany({
    where: { city: { contains: 'Sa Pa' } },
    include: {
      roomTypes: {
        include: { rooms: true }
      }
    }
  });
  console.log(JSON.stringify(hotels, null, 2));
}

main().finally(() => prisma.$disconnect());
