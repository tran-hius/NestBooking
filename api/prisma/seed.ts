import { prisma } from "../src/config/prisma";
import {
  BedType,
  BookingStatus,
  HotelStatus,
  PaymentMethod,
  PaymentStatus,
  PropertyType,
  Role,
  RoomStatus,
  UserStatus,
} from "../generated/prisma";
import bcrypt from "bcrypt";

const DEMO_PASSWORD = "123456";

async function main() {
  console.log("Seeding NestBooking demo data...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const usersData = [
    {
      email: "admin@booking.com",
      role: Role.ADMIN,
      fullName: "NestBooking Admin",
      phoneNumber: "0900000001",
    },
    {
      email: "agent1@booking.com",
      role: Role.AGENT,
      fullName: "Nguyen Van Agent",
      phoneNumber: "0900000002",
    },
    {
      email: "user1@booking.com",
      role: Role.USER,
      fullName: "Tran Thi User",
      phoneNumber: "0900000005",
    },
  ];

  const seededUsers = new Map<string, { id: string }>();
  for (const userData of usersData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
      select: { id: true },
    });
    await prisma.userProfile.updateMany({
      where: {
        phoneNumber: userData.phoneNumber,
        ...(existingUser ? { userId: { not: existingUser.id } } : {}),
      },
      data: { phoneNumber: null },
    });

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        passwordHash,
        role: userData.role,
        status: UserStatus.ACTIVE,
        deletedAt: null,
        loginAttempts: 0,
        lockUntil: null,
        profile: {
          upsert: {
            create: {
              fullName: userData.fullName,
              phoneNumber: userData.phoneNumber,
            },
            update: {
              fullName: userData.fullName,
              phoneNumber: userData.phoneNumber,
            },
          },
        },
      },
      create: {
        email: userData.email,
        passwordHash,
        role: userData.role,
        status: UserStatus.ACTIVE,
        profile: {
          create: {
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
          },
        },
      },
    });
    seededUsers.set(user.email, user);
  }

  const destinations = [
    {
      name: "Hà Nội",
      slug: "ha-noi",
      imageUrl: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&q=80&w=1200",
      description: "Thủ đô ngàn năm văn hiến",
    },
    {
      name: "Đà Nẵng",
      slug: "da-nang",
      imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=1200",
      description: "Thành phố biển năng động và đáng sống",
    },
    {
      name: "Hạ Long",
      slug: "ha-long",
      imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200",
      description: "Kỳ quan thiên nhiên thế giới",
    },
    {
      name: "Ninh Bình",
      slug: "ninh-binh",
      imageUrl: "https://images.unsplash.com/photo-1521993117367-b7f70ccd029d?auto=format&fit=crop&q=80&w=1200",
      description: "Danh thắng non nước hữu tình",
    },
    {
      name: "Cát Bà",
      slug: "cat-ba",
      imageUrl: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&q=80&w=1200",
      description: "Đảo ngọc của miền Bắc",
    },
    {
      name: "TP. Hồ Chí Minh",
      slug: "ho-chi-minh",
      imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=1200",
      description: "Thành phố sôi động với nhịp sống hiện đại",
    },
    {
      name: "Phú Quốc",
      slug: "phu-quoc",
      imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=1200",
      description: "Thiên đường biển đảo phía Nam",
    },
    {
      name: "Nha Trang",
      slug: "nha-trang",
      imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=1200",
      description: "Thành phố biển với nhiều hoạt động nghỉ dưỡng",
    },
    {
      name: "Đà Lạt",
      slug: "da-lat",
      imageUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&q=80&w=1200",
      description: "Thành phố ngàn hoa và khí hậu mát mẻ",
    },
    {
      name: "Hội An",
      slug: "hoi-an",
      imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=1200",
      description: "Phố cổ giàu bản sắc bên dòng Thu Bồn",
    },
    {
      name: "Huế",
      slug: "hue",
      imageUrl: "https://images.unsplash.com/photo-1575986767340-5d17ae767ab0?auto=format&fit=crop&q=80&w=1200",
      description: "Cố đô với di sản văn hóa và ẩm thực đặc sắc",
    },
    {
      name: "Sa Pa",
      slug: "sa-pa",
      imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200",
      description: "Thị trấn vùng cao giữa núi rừng Tây Bắc",
    },
  ];

  for (const destination of destinations) {
    await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: {
        ...destination,
        country: "Vietnam",
        countryFlag: "VN",
        isActive: true,
        isFeatured: true,
      },
      create: {
        ...destination,
        country: "Vietnam",
        countryFlag: "VN",
        isActive: true,
        isFeatured: true,
      },
    });
  }

  const agent = seededUsers.get("agent1@booking.com");
  if (!agent) throw new Error("Demo agent was not created");

  const createRoomTypes = (basePrice: number) => [
    {
      name: "Superior Double",
      description: "Phòng tiện nghi dành cho hai khách, phù hợp chuyến công tác hoặc nghỉ dưỡng ngắn ngày.",
      price: basePrice,
      maxGuests: 2,
      maxAdults: 2,
      maxChildren: 1,
      bedType: BedType.DOUBLE,
      bedCount: 1,
      area: 26,
      rooms: ["101", "102", "103"],
    },
    {
      name: "Family Deluxe",
      description: "Phòng rộng rãi dành cho gia đình hoặc nhóm bạn, có khu vực sinh hoạt riêng.",
      price: Math.round(basePrice * 1.65),
      maxGuests: 4,
      maxAdults: 3,
      maxChildren: 2,
      bedType: BedType.QUEEN,
      bedCount: 2,
      area: 42,
      rooms: ["201", "202", "203"],
    },
  ];

  const hotelsData = [
    {
      slug: "hanoi-central-hotel",
      name: "Hanoi Central Hotel",
      description: "Khách sạn hiện đại nằm tại trung tâm phố cổ Hà Nội, thuận tiện tham quan Hồ Gươm và các điểm du lịch nổi tiếng.",
      address: "36 Hàng Bông, Hoàn Kiếm",
      city: "Hà Nội",
      latitude: 21.0292,
      longitude: 105.8485,
      phone: "02439001234",
      email: "hanoi@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOTEL,
      rating: 4.7,
      amenities: ["WIFI", "BREAKFAST", "AIR_CONDITIONING", "RESTAURANT"],
      roomTypes: [
        {
          name: "Standard Double",
          description: "Phòng tiêu chuẩn dành cho hai khách, đầy đủ tiện nghi.",
          price: 850000,
          maxGuests: 2,
          maxAdults: 2,
          maxChildren: 1,
          bedType: BedType.DOUBLE,
          bedCount: 1,
          area: 24,
          rooms: ["101", "102", "103"],
        },
        {
          name: "Deluxe King",
          description: "Phòng rộng rãi với giường King và tầm nhìn thành phố.",
          price: 1250000,
          maxGuests: 3,
          maxAdults: 2,
          maxChildren: 1,
          bedType: BedType.KING,
          bedCount: 1,
          area: 32,
          rooms: ["201", "202", "203"],
        },
      ],
    },
    {
      slug: "danang-ocean-resort",
      name: "Danang Ocean Resort",
      description: "Khu nghỉ dưỡng sát biển Mỹ Khê với hồ bơi, nhà hàng và không gian thư giãn dành cho gia đình.",
      address: "268 Võ Nguyên Giáp, Ngũ Hành Sơn",
      city: "Đà Nẵng",
      latitude: 16.0471,
      longitude: 108.2498,
      phone: "02363881234",
      email: "danang@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.RESORT,
      rating: 4.8,
      amenities: ["WIFI", "BREAKFAST", "POOL", "BEACH", "SPA"],
      roomTypes: [
        {
          name: "Ocean Deluxe",
          description: "Phòng ban công hướng biển dành cho hai khách.",
          price: 1450000,
          maxGuests: 2,
          maxAdults: 2,
          maxChildren: 1,
          bedType: BedType.QUEEN,
          bedCount: 1,
          area: 35,
          rooms: ["301", "302", "303"],
        },
        {
          name: "Family Suite",
          description: "Suite gia đình rộng rãi, phù hợp nhóm bốn khách.",
          price: 2200000,
          maxGuests: 4,
          maxAdults: 3,
          maxChildren: 2,
          bedType: BedType.DOUBLE,
          bedCount: 2,
          area: 52,
          rooms: ["401", "402", "403"],
        },
      ],
    },
    {
      slug: "halong-bay-view-hotel",
      name: "Halong Bay View Hotel",
      description: "Khách sạn gần bờ vịnh với tầm nhìn thoáng, thuận tiện di chuyển tới bến tàu tham quan Hạ Long.",
      address: "18 Hạ Long, Bãi Cháy",
      city: "Hạ Long",
      latitude: 20.9505,
      longitude: 107.0734,
      phone: "02033881234",
      email: "halong@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOTEL,
      rating: 4.5,
      amenities: ["WIFI", "BREAKFAST", "RESTAURANT", "PARKING"],
      roomTypes: createRoomTypes(920000),
    },
    {
      slug: "ninh-binh-riverside-retreat",
      name: "Ninh Binh Riverside Retreat",
      description: "Khu nghỉ yên tĩnh bên sông, phù hợp khám phá Tràng An, Tam Cốc và các danh thắng Ninh Bình.",
      address: "Thôn Văn Lâm, Hoa Lư",
      city: "Ninh Bình",
      latitude: 20.2156,
      longitude: 105.9361,
      phone: "02293881234",
      email: "ninhbinh@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1521993117367-b7f70ccd029d?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOMESTAY,
      rating: 4.6,
      amenities: ["WIFI", "BREAKFAST", "GARDEN", "BIKE_RENTAL"],
      roomTypes: createRoomTypes(680000),
    },
    {
      slug: "cat-ba-island-resort",
      name: "Cat Ba Island Resort",
      description: "Khu nghỉ dưỡng gần biển Cát Cò, có không gian xanh và nhiều tiện ích dành cho gia đình.",
      address: "12 Cát Cò, Cát Hải",
      city: "Cát Bà",
      latitude: 20.7268,
      longitude: 107.0482,
      phone: "02253881234",
      email: "catba@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.RESORT,
      rating: 4.4,
      amenities: ["WIFI", "POOL", "BEACH", "RESTAURANT"],
      roomTypes: createRoomTypes(1100000),
    },
    {
      slug: "saigon-riverside-hotel",
      name: "Saigon Riverside Hotel",
      description: "Khách sạn trung tâm thuận tiện tham quan phố đi bộ Nguyễn Huệ, chợ Bến Thành và khu mua sắm.",
      address: "55 Tôn Đức Thắng, Quận 1",
      city: "TP. Hồ Chí Minh",
      latitude: 10.7771,
      longitude: 106.7065,
      phone: "02838812345",
      email: "saigon@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOTEL,
      rating: 4.7,
      amenities: ["WIFI", "BREAKFAST", "GYM", "RESTAURANT"],
      roomTypes: createRoomTypes(1350000),
    },
    {
      slug: "phu-quoc-sunset-resort",
      name: "Phu Quoc Sunset Resort",
      description: "Khu nghỉ dưỡng bên bãi biển với hồ bơi, spa và không gian ngắm hoàng hôn trên đảo Phú Quốc.",
      address: "89 Trần Hưng Đạo, Dương Đông",
      city: "Phú Quốc",
      latitude: 10.1931,
      longitude: 103.9653,
      phone: "02973881234",
      email: "phuquoc@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.RESORT,
      rating: 4.9,
      amenities: ["WIFI", "BREAKFAST", "POOL", "BEACH", "SPA"],
      roomTypes: createRoomTypes(1850000),
    },
    {
      slug: "nha-trang-seaside-hotel",
      name: "Nha Trang Seaside Hotel",
      description: "Khách sạn gần biển Trần Phú, phù hợp cho khách muốn tận hưởng biển và khám phá trung tâm Nha Trang.",
      address: "42 Trần Phú, Lộc Thọ",
      city: "Nha Trang",
      latitude: 12.2388,
      longitude: 109.1967,
      phone: "02583881234",
      email: "nhatrang@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOTEL,
      rating: 4.6,
      amenities: ["WIFI", "BREAKFAST", "POOL", "SEA_VIEW"],
      roomTypes: createRoomTypes(1200000),
    },
    {
      slug: "dalat-pine-hill-villa",
      name: "Dalat Pine Hill Villa",
      description: "Biệt thự giữa đồi thông với không gian ấm cúng, thích hợp cho gia đình và nhóm bạn nghỉ dưỡng tại Đà Lạt.",
      address: "25 Đặng Thái Thân, Phường 3",
      city: "Đà Lạt",
      latitude: 11.9295,
      longitude: 108.4459,
      phone: "02633881234",
      email: "dalat@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.VILLA,
      rating: 4.8,
      amenities: ["WIFI", "GARDEN", "KITCHEN", "PARKING"],
      roomTypes: createRoomTypes(980000),
    },
    {
      slug: "hoi-an-lantern-homestay",
      name: "Hoi An Lantern Homestay",
      description: "Homestay phong cách phố cổ, nằm gần sông Hoài và các tuyến phố đi bộ nổi tiếng của Hội An.",
      address: "16 Nguyễn Phúc Chu, Minh An",
      city: "Hội An",
      latitude: 15.8772,
      longitude: 108.3269,
      phone: "02353881234",
      email: "hoian@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOMESTAY,
      rating: 4.7,
      amenities: ["WIFI", "BREAKFAST", "BIKE_RENTAL", "GARDEN"],
      roomTypes: createRoomTypes(720000),
    },
    {
      slug: "hue-imperial-boutique",
      name: "Hue Imperial Boutique Hotel",
      description: "Khách sạn boutique gần Đại Nội, kết hợp phong cách truyền thống Huế với tiện nghi hiện đại.",
      address: "38 Lê Lợi, Phú Hội",
      city: "Huế",
      latitude: 16.4637,
      longitude: 107.5909,
      phone: "02343881234",
      email: "hue@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOTEL,
      rating: 4.5,
      amenities: ["WIFI", "BREAKFAST", "RESTAURANT", "AIR_CONDITIONING"],
      roomTypes: createRoomTypes(800000),
    },
    {
      slug: "sapa-cloudy-mountain-lodge",
      name: "Sapa Cloudy Mountain Lodge",
      description: "Chỗ nghỉ nhìn ra thung lũng Mường Hoa, thuận tiện khám phá bản làng và các cung đường vùng cao Sa Pa.",
      address: "72 Fansipan, Trung tâm Sa Pa",
      city: "Sa Pa",
      latitude: 22.3354,
      longitude: 103.8438,
      phone: "02143881234",
      email: "sapa@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOMESTAY,
      rating: 4.8,
      amenities: ["WIFI", "BREAKFAST", "MOUNTAIN_VIEW", "RESTAURANT"],
      roomTypes: createRoomTypes(890000),
    },
    {
      slug: "test-hotel-3-rooms",
      name: "Test Hotel 3 Rooms",
      description: "A hotel specifically seeded to test booking 4 rooms when only 3 are available.",
      address: "123 Test Street",
      city: "Test City",
      latitude: 10.7771,
      longitude: 106.7065,
      phone: "0123456789",
      email: "test3rooms@nestbooking.demo",
      thumbnail: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=1200",
      propertyType: PropertyType.HOTEL,
      rating: 5.0,
      amenities: ["WIFI", "TV", "AC"],
      roomTypes: [
        {
          name: "Standard 3-Room",
          description: "A standard room type with exactly 3 rooms.",
          price: 500000,
          maxGuests: 3,
          maxAdults: 2,
          maxChildren: 1,
          bedType: BedType.DOUBLE,
          bedCount: 1,
          area: 25,
          rooms: ["101", "102", "103"],
        }
      ],
    },
  ];

  for (const hotelData of hotelsData) {
    const hotel = await prisma.hotel.upsert({
      where: { slug: hotelData.slug },
      update: {
        ownerId: agent.id,
        name: hotelData.name,
        description: hotelData.description,
        address: hotelData.address,
        city: hotelData.city,
        country: "Vietnam",
        latitude: hotelData.latitude,
        longitude: hotelData.longitude,
        phone: hotelData.phone,
        email: hotelData.email,
        thumbnail: hotelData.thumbnail,
        amenities: hotelData.amenities,
        rating: hotelData.rating,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        status: HotelStatus.ACTIVE,
        propertyType: hotelData.propertyType,
        deletedAt: null,
      },
      create: {
        ownerId: agent.id,
        slug: hotelData.slug,
        name: hotelData.name,
        description: hotelData.description,
        address: hotelData.address,
        city: hotelData.city,
        country: "Vietnam",
        latitude: hotelData.latitude,
        longitude: hotelData.longitude,
        phone: hotelData.phone,
        email: hotelData.email,
        thumbnail: hotelData.thumbnail,
        amenities: hotelData.amenities,
        rating: hotelData.rating,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        status: HotelStatus.ACTIVE,
        propertyType: hotelData.propertyType,
      },
    });

    await prisma.hotelImage.deleteMany({ where: { hotelId: hotel.id } });
    await prisma.hotelImage.createMany({
      data: [
        { hotelId: hotel.id, imageUrl: hotelData.thumbnail },
        {
          hotelId: hotel.id,
          imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200",
        },
        {
          hotelId: hotel.id,
          imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    });

    for (const roomTypeData of hotelData.roomTypes) {
      const roomType = await prisma.roomType.upsert({
        where: {
          hotelId_name: { hotelId: hotel.id, name: roomTypeData.name },
        },
        update: {
          description: roomTypeData.description,
          price: roomTypeData.price,
          maxGuests: roomTypeData.maxGuests,
          maxAdults: roomTypeData.maxAdults,
          maxChildren: roomTypeData.maxChildren,
          bedType: roomTypeData.bedType,
          bedCount: roomTypeData.bedCount,
          area: roomTypeData.area,
          thumbnail: hotelData.thumbnail,
          isActive: true,
          amenities: hotelData.amenities,
        },
        create: {
          hotelId: hotel.id,
          name: roomTypeData.name,
          description: roomTypeData.description,
          price: roomTypeData.price,
          maxGuests: roomTypeData.maxGuests,
          maxAdults: roomTypeData.maxAdults,
          maxChildren: roomTypeData.maxChildren,
          bedType: roomTypeData.bedType,
          bedCount: roomTypeData.bedCount,
          area: roomTypeData.area,
          thumbnail: hotelData.thumbnail,
          isActive: true,
          amenities: hotelData.amenities,
        },
      });

      for (const roomNumber of roomTypeData.rooms) {
        await prisma.room.upsert({
          where: {
            hotelId_roomNumber: { hotelId: hotel.id, roomNumber },
          },
          update: {
            roomTypeId: roomType.id,
            status: RoomStatus.AVAILABLE,
            isActive: true,
          },
          create: {
            hotelId: hotel.id,
            roomTypeId: roomType.id,
            roomNumber,
            floor: Number(roomNumber[0]),
            status: RoomStatus.AVAILABLE,
            isActive: true,
          },
        });
      }
    }
  }

  const demoUser = seededUsers.get("user1@booking.com");
  const hanoiHotel = await prisma.hotel.findUnique({
    where: { slug: "hanoi-central-hotel" },
    include: { roomTypes: { orderBy: { price: "asc" } } },
  });
  if (!demoUser || !hanoiHotel || hanoiHotel.roomTypes.length < 2) {
    throw new Error("Demo booking dependencies were not created");
  }

  const dateFromToday = (days: number) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date;
  };
  const demoBookings = [
    {
      bookingCode: "DEMO-PENDING-001",
      roomTypeId: hanoiHotel.roomTypes[0].id,
      checkInDate: dateFromToday(5),
      checkOutDate: dateFromToday(7),
      quantity: 1,
      totalAmount: Number(hanoiHotel.roomTypes[0].price) * 2,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      guestName: "Nguyen Minh Anh",
      guestPhone: "0911000001",
      guestEmail: "minhanh@example.com",
    },
    {
      bookingCode: "DEMO-CONFIRMED-001",
      roomTypeId: hanoiHotel.roomTypes[1].id,
      checkInDate: dateFromToday(12),
      checkOutDate: dateFromToday(15),
      quantity: 1,
      totalAmount: Number(hanoiHotel.roomTypes[1].price) * 3,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.UNPAID,
      guestName: "Le Hoang Nam",
      guestPhone: "0911000002",
      guestEmail: "hoangnam@example.com",
    },
    {
      bookingCode: "DEMO-COMPLETED-001",
      roomTypeId: hanoiHotel.roomTypes[0].id,
      checkInDate: dateFromToday(-12),
      checkOutDate: dateFromToday(-10),
      quantity: 2,
      totalAmount: Number(hanoiHotel.roomTypes[0].price) * 4,
      status: BookingStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      guestName: "Tran Thu Ha",
      guestPhone: "0911000003",
      guestEmail: "thuha@example.com",
    },
    {
      bookingCode: "DEMO-CANCELLED-001",
      roomTypeId: hanoiHotel.roomTypes[1].id,
      checkInDate: dateFromToday(20),
      checkOutDate: dateFromToday(22),
      quantity: 1,
      totalAmount: Number(hanoiHotel.roomTypes[1].price) * 2,
      status: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.UNPAID,
      guestName: "Pham Gia Bao",
      guestPhone: "0911000004",
      guestEmail: "giabao@example.com",
    },
  ];

  for (const booking of demoBookings) {
    await prisma.booking.upsert({
      where: { bookingCode: booking.bookingCode },
      update: {
        ...booking,
        userId: demoUser.id,
        hotelId: hanoiHotel.id,
        paymentMethod: PaymentMethod.PAY_AT_HOTEL,
        paymentDate: booking.paymentStatus === PaymentStatus.PAID ? booking.checkOutDate : null,
        specialRequests: "Dữ liệu mẫu cho lịch đặt phòng đối tác",
        deletedAt: null,
      },
      create: {
        ...booking,
        userId: demoUser.id,
        hotelId: hanoiHotel.id,
        paymentMethod: PaymentMethod.PAY_AT_HOTEL,
        paymentDate: booking.paymentStatus === PaymentStatus.PAID ? booking.checkOutDate : null,
        specialRequests: "Dữ liệu mẫu cho lịch đặt phòng đối tác",
      },
    });
  }

  console.log("Demo accounts:");
  console.log(`  Admin: admin@booking.com / ${DEMO_PASSWORD}`);
  console.log(`  Agent: agent1@booking.com / ${DEMO_PASSWORD}`);
  console.log(`  User:  user1@booking.com / ${DEMO_PASSWORD}`);
  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
