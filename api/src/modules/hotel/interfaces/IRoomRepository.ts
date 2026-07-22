import { Room, Prisma } from "../../../../generated/prisma";
import { TxClient } from "@/config/prisma";

export interface IRoomRepository {
  create(data: Prisma.RoomUncheckedCreateInput, tx?: TxClient): Promise<Room>;
  update(id: string, data: Prisma.RoomUpdateInput, tx?: TxClient): Promise<Room>;
  delete(id: string, tx?: TxClient): Promise<void>;
  findById(id: string, tx?: TxClient): Promise<Room | null>;
  findByHotelId(hotelId: string, tx?: TxClient): Promise<Room[]>;
  findByRoomTypeId(roomTypeId: string, tx?: TxClient): Promise<Room[]>;
  existsByNumber(hotelId: string, roomNumber: string, tx?: TxClient): Promise<boolean>;
}
