import {
  Hotel,
  HotelStatus,
  Prisma,
  PrismaClient,
} from "../../../../generated/prisma";
import { IHotelRepository } from "../interfaces/IHotelRepository";
import { TxClient } from "@/config/prisma";

export class HotelRepository implements IHotelRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(
    data: Prisma.HotelUncheckedCreateInput,
    tx?: TxClient,
  ): Promise<Hotel> {
    const client = tx || this.prisma;
    return client.hotel.create({
      data,
      // Lấy đầy đủ quan hệ ngay khi vừa tạo xong để trả về Client nếu cần
      include: {
        owner: true,
        images: true,
        roomTypes: true,
      },
    });
  }

  async findById(id: string, tx?: TxClient): Promise<Hotel | null> {
    const client = tx || this.prisma;
    return client.hotel.findUnique({
      where: { id },
      include: {
        owner: true,
        images: true,
        roomTypes: true,
      },
    });
  }

  async findBySlug(slug: string, tx?: TxClient): Promise<Hotel | null> {
    const client = tx || this.prisma;
    return client.hotel.findUnique({
      where: { slug },
      include: {
        owner: true,
        images: true,
        roomTypes: true,
      },
    });
  }

  async findByOwnerId(ownerId: string, tx?: TxClient): Promise<Hotel[]> {
    const client = tx || this.prisma;
    return client.hotel.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        owner: true,
        images: true,
        roomTypes: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.HotelUpdateInput,
    tx?: TxClient,
  ): Promise<Hotel> {
    const client = tx || this.prisma;
    return client.hotel.update({
      where: { id },
      data,
      include: {
        owner: true,
        images: true,
        roomTypes: true,
      },
    });
  }

  async delete(id: string, tx?: TxClient): Promise<void> {
    const client = tx || this.prisma;
    await client.hotel.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: HotelStatus.INACTIVE,
      },
    });
  }

  async restore(id: string, ownerId: string, tx?: TxClient): Promise<void> {
    const client = tx || this.prisma;
    await client.hotel.update({
      where: { id, ownerId },
      data: { deletedAt: null },
    });
  }

  async existsBySlug(slug: string, tx?: TxClient): Promise<boolean> {
    const client = tx || this.prisma;
    const count = await client.hotel.count({
      where: { slug },
    });
    return count > 0;
  }

  async findMany(
    options?: Prisma.HotelFindManyArgs,
    tx?: TxClient,
  ): Promise<Hotel[]> {
    const client = tx || this.prisma;
    return client.hotel.findMany(options);
  }

  async count(options?: Prisma.HotelCountArgs, tx?: TxClient): Promise<number> {
    const client = tx || this.prisma;
    return client.hotel.count(options);
  }

  async addImages(images: { hotelId: string; imageUrl: string }[], tx?: TxClient): Promise<void> {
    const client = tx || this.prisma;
    await client.hotelImage.createMany({
      data: images,
    });
  }

  async findImageById(imageId: string, tx?: TxClient): Promise<any> {
    const client = tx || this.prisma;
    return client.hotelImage.findUnique({
      where: { id: imageId },
    });
  }

  async deleteImage(imageId: string, tx?: TxClient): Promise<void> {
    const client = tx || this.prisma;
    await client.hotelImage.delete({
      where: { id: imageId },
    });
  }
}
