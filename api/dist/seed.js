import { PrismaClient, PropertyType, BedType } from "../generated/prisma/index.js";
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.create({
        data: {
            email: "test_booking_" + Date.now() + "@example.com",
            profile: {
                create: {
                    fullName: "Test User",
                    phoneNumber: "0123456789"
                }
            }
        }
    });
    const agent = await prisma.user.create({
        data: {
            email: "agent_" + Date.now() + "@example.com",
            role: "AGENT",
            agentProfile: {
                create: {
                    businessName: "Test Hotel Business",
                    approvalStatus: "ACTIVE"
                }
            }
        }
    });
    const hotel = await prisma.hotel.create({
        data: {
            ownerId: agent.id,
            name: "Khách sạn & Du lịch Hanoi Center Silk Classic",
            slug: "hanoi-center-silk-" + Date.now(),
            address: "41 Phố Bát Sứ, Hàng Bồ",
            city: "Hà Nội",
            propertyType: PropertyType.HOTEL,
            status: "ACTIVE"
        }
    });
    const roomType = await prisma.roomType.create({
        data: {
            hotelId: hotel.id,
            name: "Phòng Deluxe Giường Đôi",
            price: 1110000,
            maxGuests: 2,
            maxAdults: 2,
            maxChildren: 1,
            bedType: BedType.DOUBLE,
            bedCount: 1,
            isActive: true
        }
    });
    const room = await prisma.room.create({
        data: {
            hotelId: hotel.id,
            roomTypeId: roomType.id,
            roomNumber: "101",
            status: "AVAILABLE",
            isActive: true
        }
    });
    console.log(JSON.stringify({
        userId: user.id,
        hotelId: hotel.id,
        roomTypeId: roomType.id,
        roomId: room.id
    }));
}
main().catch(console.error).finally(() => prisma.$disconnect());
