import { prisma } from "@/config/prisma";
import { IDestinationRepository } from "../interfaces/iDestinationRepository";
import { Destination } from "../../../../generated/prisma";

export class DestinationRepository implements IDestinationRepository {
  async getActiveDestinations(): Promise<Destination[]> {
    return prisma.destination.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getAllDestinations(): Promise<Destination[]> {
    return prisma.destination.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createDestination(data: any): Promise<Destination> {
    return prisma.destination.create({
      data
    });
  }

  async updateDestination(id: string, data: any): Promise<Destination> {
    return prisma.destination.update({
      where: { id },
      data
    });
  }

  async deleteDestination(id: string): Promise<void> {
    await prisma.destination.delete({
      where: { id }
    });
  }

  async toggleFeatured(id: string): Promise<Destination> {
    const destination = await prisma.destination.findUnique({ where: { id } });
    if (!destination) throw new Error("Destination not found");
    return prisma.destination.update({
      where: { id },
      data: { isFeatured: !destination.isFeatured }
    });
  }
}
