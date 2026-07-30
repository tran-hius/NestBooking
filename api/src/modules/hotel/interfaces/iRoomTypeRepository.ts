import { RoomType, Prisma } from "../../../../generated/prisma";
import { TxClient } from "@/config/prisma";

export interface IRoomTypeRepository {
  create(data: Prisma.RoomTypeUncheckedCreateInput, tx?: TxClient): Promise<RoomType>;
  update(id: string, data: Prisma.RoomTypeUpdateInput, tx?: TxClient): Promise<RoomType>;
  delete(id: string, tx?: TxClient): Promise<void>;
  findById(id: string, tx?: TxClient): Promise<RoomType | null>;
  findByHotelId(hotelId: string, tx?: TxClient): Promise<RoomType[]>;
  findPublicByHotelId(hotelId: string, tx?: TxClient): Promise<RoomType[]>;
  existsByName(hotelId: string, name: string, tx?: TxClient): Promise<boolean>;

  addImages(data: Prisma.RoomTypeImageCreateManyInput[], tx?: TxClient): Promise<void>;
  deleteImage(imageId: string, tx?: TxClient): Promise<void>;
  findImageById(imageId: string, tx?: TxClient): Promise<Prisma.RoomTypeImageGetPayload<{}> | null>;
}
