import { prisma } from '../config/prisma';

async function main() {
  const roomTypes = await prisma.roomType.findMany({
    include: { rooms: true }
  });

  let createdCount = 0;

  for (const rt of roomTypes) {
    if (rt.rooms.length === 0) {
      console.log(`Generating rooms for RoomType: ${rt.name} (${rt.id})`);
      for (let i = 1; i <= Math.max(5, rt.bedCount || 5); i++) {
        await prisma.room.create({
          data: {
            hotelId: rt.hotelId,
            roomTypeId: rt.id,
            roomNumber: `${rt.name.substring(0, 3).toUpperCase()}-${100 + i}`,
            status: 'AVAILABLE',
            isActive: true
          }
        });
        createdCount++;
      }
    }
  }

  console.log(`Created ${createdCount} missing physical rooms.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
