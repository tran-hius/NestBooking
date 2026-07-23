import { RoomType, Prisma, PrismaClient } from "../../../../generated/prisma";
import { IRoomTypeRepository } from "../interfaces/IRoomTypeRepository";
import { TxClient } from "@/config/prisma";

export class RoomTypeRepository implements IRoomTypeRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(
    data: Prisma.RoomTypeUncheckedCreateInput,
    tx?: TxClient,
  ): Promise<RoomType> {
    const client = tx || this.prisma;
    return client.roomType.create({
      data,
      include: { images: true },
    });
  }

  async update(
    id: string,
    data: Prisma.RoomTypeUpdateInput,
    tx?: TxClient,
  ): Promise<RoomType> {
    const client = tx || this.prisma;
    return client.roomType.update({
      where: { id },
      data,
      include: { images: true },
    });
  }

  async delete(id: string, tx?: TxClient): Promise<void> {
    const client = tx || this.prisma;
    await client.roomType.delete({
      where: { id },
    });
  }

  async findById(id: string, tx?: TxClient): Promise<RoomType | null> {
    const client = tx || this.prisma;
    return client.roomType.findUnique({
      where: { id },
      include: {
        images: true,
        _count: {
          select: { rooms: true },
        },
      },
    });
  }

  async findByHotelId(hotelId: string, tx?: TxClient): Promise<RoomType[]> {
    const client = tx || this.prisma;
    return client.roomType.findMany({
      where: { hotelId },
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        _count: {
          select: { rooms: true },
        },
      },
    });
  }

  async findPublicByHotelId(
    hotelId: string,
    tx?: TxClient,
  ): Promise<RoomType[]> {
    const client = tx || this.prisma;
    return client.roomType.findMany({
      where: {
        hotelId,
        isActive: true, // Chỉ lấy phòng đang mở bán
      },
      orderBy: { price: "asc" },
      include: {
        images: true,
        _count: {
          select: { rooms: true },
        },
      },
    });
  }

  async existsByName(
    hotelId: string,
    name: string,
    tx?: TxClient,
  ): Promise<boolean> {
    const client = tx || this.prisma;
    const count = await client.roomType.count({
      where: { hotelId, name },
    });
    return count > 0;
  }

  async addImages(
    data: Prisma.RoomTypeImageCreateManyInput[],
    tx?: TxClient,
  ): Promise<void> {
    const client = tx || this.prisma;
    await client.roomTypeImage.createMany({
      data,
    });
  }

  async deleteImage(imageId: string, tx?: TxClient): Promise<void> {
    const client = tx || this.prisma;
    await client.roomTypeImage.delete({
      where: { id: imageId },
    });
  }

  async findImageById(
    imageId: string,
    tx?: TxClient,
  ): Promise<Prisma.RoomTypeImageGetPayload<{}> | null> {
    const client = tx || this.prisma;
    return client.roomTypeImage.findUnique({
      where: { id: imageId },
    });
  }

  
}
