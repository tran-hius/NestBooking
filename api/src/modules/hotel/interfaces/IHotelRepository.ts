import { Hotel, Prisma } from "../../../../generated/prisma";

export interface IHotelRepository {
  create(data: Prisma.HotelUncheckedCreateInput): Promise<Hotel>;

  findById(id: string): Promise<Hotel | null>;

  findBySlug(slug: string): Promise<Hotel | null>;

  findByOwnerId(ownerId: string): Promise<Hotel[]>;

  update(id: string, data: Prisma.HotelUpdateInput): Promise<Hotel>;

  delete(id: string): Promise<void>;

  existsBySlug(slug: string): Promise<boolean>;

  findMany(options?: Prisma.HotelFindManyArgs): Promise<Hotel[]>;
}
