import { Room, Prisma, PrismaClient } from "../../../../generated/prisma";
import { IRoomRepository } from "../interfaces/IRoomRepository";
import { TxClient } from "@/config/prisma";

export class RoomRepository implements IRoomRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.RoomUncheckedCreateInput, tx?: TxClient): Promise<Room> {
    const client = tx || this.prisma;
    return client.room.create({
      data,
    });
  }

  async update(id: string, data: Prisma.RoomUpdateInput, tx?: TxClient): Promise<Room> {
    const client = tx || this.prisma;
    return client.room.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tx?: TxClient): Promise<void> {
    const client = tx || this.prisma;
    await client.room.delete({
      where: { id },
    });
  }

  async findById(id: string, tx?: TxClient): Promise<Room | null> {
    const client = tx || this.prisma;
    return client.room.findUnique({
      where: { id },
    });
  }

  async findByHotelId(hotelId: string, tx?: TxClient): Promise<Room[]> {
    const client = tx || this.prisma;
    return client.room.findMany({
      where: { hotelId },
      orderBy: { roomNumber: "asc" },
    });
  }

  async findByRoomTypeId(roomTypeId: string, tx?: TxClient): Promise<Room[]> {
    const client = tx || this.prisma;
    return client.room.findMany({
      where: { roomTypeId },
      orderBy: { roomNumber: "asc" },
    });
  }

  async existsByNumber(hotelId: string, roomNumber: string, tx?: TxClient): Promise<boolean> {
    const client = tx || this.prisma;
    const count = await client.room.count({
      where: { hotelId, roomNumber },
    });
    return count > 0;
  }
}
