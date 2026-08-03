import { prisma } from "./src/config/prisma";
import { BookingReadRepository } from "./src/modules/booking/repositories/bookingReadRepository";
import { BookingAvailabilityService } from "./src/modules/booking/services/bookingCreation/bookingAvailability";

async function main() {
  const hotelId = '47451836-dfa0-4b5c-b770-43e87150fe10';
  const roomTypeId = '74f61d47-a72c-497f-b948-1c899b3c5885';

  const readRepo = new BookingReadRepository(prisma);

  const roomTypeService = {
    getRoomTypeById: async (id: string, tx?: any) => {
      const client = tx || prisma;
      return client.roomType.findUnique({ where: { id } }) as any;
    }
  };

  const roomService = {
    countActiveRoomsByRoomType: async (id: string, tx?: any) => {
      const client = tx || prisma;
      return client.room.count({ where: { roomTypeId: id, isActive: true } });
    }
  };

  const availabilityService = new BookingAvailabilityService(roomTypeService as any, roomService as any, readRepo);

  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 1);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 3);

  console.log("Attempting to book 4 rooms...");
  try {
    const result = await availabilityService.validateAvailability(roomTypeId, 4, checkIn, checkOut);
    console.log("SUCCESS unexpectedly:", result);
  } catch (error: any) {
    console.error("EXPECTED ERROR CAUGHT:");
    console.error("Message:", error.message);
  }

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
