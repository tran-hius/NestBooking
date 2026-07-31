import { PrismaClient, Review } from "#generated/prisma";
import { IReviewRepository } from "../interfaces/iReviewRepository";

export class ReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: any): Promise<Review> {
    return this.prisma.review.create({ data });
  }

  async findById(id: string): Promise<Review | null> {
    return this.prisma.review.findUnique({ where: { id } });
  }

  async findByHotel(hotelId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { hotelId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: any): Promise<Review> {
    return this.prisma.review.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({ where: { id } });
  }
}
