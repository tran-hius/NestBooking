import { Hotel, Prisma } from "../../../../generated/prisma";
import { TxClient } from "@/config/prisma"; 

export interface IHotelRepository {
  create(data: Prisma.HotelUncheckedCreateInput, tx?: TxClient): Promise<Hotel>;
  findById(id: string, tx?: TxClient): Promise<Hotel | null>;
  findBySlug(slug: string, tx?: TxClient): Promise<Hotel | null>;
  findByOwnerId(ownerId: string, tx?: TxClient): Promise<Hotel[]>;
  update(
    id: string,
    data: Prisma.HotelUpdateInput,
    tx?: TxClient,
  ): Promise<Hotel>;
  delete(id: string, tx?: TxClient): Promise<void>;
  restore(id: string, ownerId: string, tx?: TxClient): Promise<void>;
  addImages(images: { hotelId: string; imageUrl: string }[], tx?: TxClient): Promise<void>;
  findImageById(imageId: string, tx?: TxClient): Promise<{ id: string; imageUrl: string; hotelId: string } | null>;
  deleteImage(imageId: string, tx?: TxClient): Promise<void>;
  existsBySlug(slug: string, tx?: TxClient): Promise<boolean>;
  findMany(options?: Prisma.HotelFindManyArgs, tx?: TxClient): Promise<Hotel[]>;
  count(options?: Prisma.HotelCountArgs, tx?: TxClient): Promise<number>;
}
