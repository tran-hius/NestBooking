import { prisma } from "../../../config/prisma.js";
export class DestinationRepository {
    async getActiveDestinations() {
        return prisma.destination.findMany({
            where: { isActive: true, isFeatured: true },
            orderBy: { createdAt: 'asc' }
        });
    }
    async getAllDestinations() {
        return prisma.destination.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async createDestination(data) {
        return prisma.destination.create({
            data
        });
    }
    async updateDestination(id, data) {
        return prisma.destination.update({
            where: { id },
            data
        });
    }
    async deleteDestination(id) {
        await prisma.destination.delete({
            where: { id }
        });
    }
    async toggleFeatured(id) {
        const destination = await prisma.destination.findUnique({ where: { id } });
        if (!destination)
            throw new Error("Destination not found");
        return prisma.destination.update({
            where: { id },
            data: { isFeatured: !destination.isFeatured }
        });
    }
}
