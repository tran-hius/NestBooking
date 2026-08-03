import { prisma } from "./src/config/prisma";
import { Role, RoomStatus } from "./generated/prisma";

async function main() {
  console.log('Start seeding...');
  
  // Find or create an AGENT user
  let agent = await prisma.user.findFirst({ where: { role: Role.AGENT } });
  if (!agent) {
    agent = await prisma.user.create({
      data: {
        email: 'agent_test_seed@example.com',
        password: 'hashedpassword',
        fullName: 'Agent Test',
        role: Role.AGENT,
      },
    });
  }

  const hotelName = 'Test Hotel 3 Rooms ' + Date.now();
  const hotel = await prisma.hotel.create({
    data: {
      name: hotelName,
      slug: 'test-hotel-3-rooms-' + Date.now(),
      description: 'A hotel specifically seeded to test booking 4 rooms when only 3 are available.',
      address: '123 Test Street',
      city: 'Test City',
      ownerId: agent.id,
      rating: 5,
    },
  });

  // Create a Room Type for the Hotel
  const roomType = await prisma.roomType.create({
    data: {
      hotelId: hotel.id,
      name: 'Standard 3-Room',
      description: 'A standard room type with exactly 3 rooms.',
      price: 500000,
      maxGuests: 3,
      maxAdults: 2,
      maxChildren: 1,
      area: 25,
      bedType: 'DOUBLE',
      bedCount: 1,
      amenities: ['Wifi', 'TV', 'AC'],
      isActive: true,
    },
  });

  // Create exactly 3 Rooms
  await prisma.room.createMany({
    data: [
      {
        hotelId: hotel.id,
        roomTypeId: roomType.id,
        roomNumber: '101',
        floor: 1,
        status: RoomStatus.AVAILABLE,
        isActive: true,
      },
      {
        hotelId: hotel.id,
        roomTypeId: roomType.id,
        roomNumber: '102',
        floor: 1,
        status: RoomStatus.AVAILABLE,
        isActive: true,
      },
      {
        hotelId: hotel.id,
        roomTypeId: roomType.id,
        roomNumber: '103',
        floor: 1,
        status: RoomStatus.AVAILABLE,
        isActive: true,
      },
    ],
  });

  console.log(`Seeding finished.`);
  console.log(`Hotel: ${hotel.name} (ID: ${hotel.id})`);
  console.log(`Room Type: ${roomType.name} (ID: ${roomType.id})`);
  console.log(`Created 3 rooms for this room type.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
