import { Review } from "#generated/prisma";
export interface IReviewRepository {
  create(data: any): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findByHotel(hotelId: string): Promise<Review[]>;
  update(id: string, data: any): Promise<Review>;
  delete(id: string): Promise<void>;
}