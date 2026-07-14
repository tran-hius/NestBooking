import { Hotel, HotelStatus, Prisma, PrismaClient } from "../../../../generated/prisma";

import { IHotelRepository } from "../interfaces/IHotelRepository";

export class HotelRepository implements IHotelRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.HotelUncheckedCreateInput): Promise<Hotel> {
    return this.prisma.hotel.create({
      data,
    });
  }

  async findById(id: string): Promise<Hotel | null> {
    return this.prisma.hotel.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Hotel | null> {
    return this.prisma.hotel.findUnique({
      where: { slug },
    });
  }

  async findByOwnerId(ownerId: string): Promise<Hotel[]> {
    return this.prisma.hotel.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: Prisma.HotelUpdateInput): Promise<Hotel> {
    return this.prisma.hotel.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.hotel.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: HotelStatus.INACTIVE
      }
    });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prisma.hotel.count({
      where: { slug },
    });
    return count > 0;
  }

  async findMany(options?: Prisma.HotelFindManyArgs): Promise<Hotel[]> {
    return this.prisma.hotel.findMany(options);
  }
}
