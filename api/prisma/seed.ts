import { prisma } from "../src/config/prisma";
import { Role, UserStatus } from "../generated/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Start seeding...");

  const passwordHash = await bcrypt.hash("123456", 10);

  const usersData = [
    {
      email: "admin@booking.com",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      fullName: "Super Admin",
      phoneNumber: "0900000001",
    },
    {
      email: "agent1@booking.com",
      role: Role.AGENT,
      status: UserStatus.ACTIVE,
      fullName: "Nguyen Van Agent",
      phoneNumber: "0900000002",
    },
    {
      email: "agent2@booking.com",
      role: Role.AGENT,
      status: UserStatus.PENDING,
      fullName: "Le Thi Agent",
      phoneNumber: "0900000003",
    },
    {
      email: "agent3@booking.com",
      role: Role.AGENT,
      status: UserStatus.REJECTED,
      fullName: "Pham Van Agent",
      phoneNumber: "0900000004",
    },
    {
      email: "user1@booking.com",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      fullName: "Tran Thi User",
      phoneNumber: "0900000005",
    },
    {
      email: "user2@booking.com",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      fullName: "Hoang Van User",
      phoneNumber: "0900000006",
    },
    {
      email: "user3@booking.com",
      role: Role.USER,
      status: UserStatus.PENDING,
      fullName: "Do Thi User",
      phoneNumber: "0900000007",
    },
    {
      email: "user4@booking.com",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      fullName: "Vu Van User",
      phoneNumber: "0900000008",
    },
    {
      email: "user5@booking.com",
      role: Role.USER,
      status: UserStatus.BANNED,
      fullName: "Bui Thi User",
      phoneNumber: "0900000009",
    },
    {
      email: "user6@booking.com",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      fullName: "Ngo Van User",
      phoneNumber: "0900000010",
    },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: {
        email: u.email,
      },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        role: u.role,
        status: u.status,
        profile: {
          create: {
            fullName: u.fullName,
            phoneNumber: u.phoneNumber,
          },
        },
      },
    });

    console.log(`✅ Created: ${user.email} (${user.role} - ${user.status})`);
  }

  console.log("🌱 Seeding Destinations...");
  const destinationsData = [
    {
      name: "Hạ Long",
      slug: "ha-long",
      imageUrl: "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=1000",
      description: "Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới"
    },
    {
      name: "Hà Nội",
      slug: "ha-noi",
      imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=1000",
      description: "Thủ đô ngàn năm văn hiến"
    },
    {
      name: "Ninh Bình",
      slug: "ninh-binh",
      imageUrl: "https://images.unsplash.com/photo-1583417657200-a544a493c0bc?auto=format&fit=crop&q=80&w=1000",
      description: "Vịnh Hạ Long trên cạn"
    },
    {
      name: "Đà Nẵng",
      slug: "da-nang",
      imageUrl: "https://images.unsplash.com/photo-1559508551-44bff1fe756b?auto=format&fit=crop&q=80&w=1000",
      description: "Thành phố đáng sống nhất Việt Nam"
    },
    {
      name: "Cát Bà",
      slug: "cat-ba",
      imageUrl: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?auto=format&fit=crop&q=80&w=1000",
      description: "Đảo Ngọc miền Bắc"
    }
  ];

  for (const d of destinationsData) {
    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {},
      create: {
        name: d.name,
        slug: d.slug,
        imageUrl: d.imageUrl,
        description: d.description,
        isFeatured: true,
      },
    });
    console.log(`✅ Created Destination: ${dest.name}`);
  }

  console.log("🌱 Seeding finished.");
}

main()
  .catch((error) => {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
