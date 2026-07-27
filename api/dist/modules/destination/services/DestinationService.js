export class DestinationService {
    destinationRepository;
    constructor(destinationRepository) {
        this.destinationRepository = destinationRepository;
    }
    async getActiveDestinations() {
        return this.destinationRepository.getActiveDestinations();
    }
    async getAllDestinations() {
        return this.destinationRepository.getAllDestinations();
    }
    async createDestination(data) {
        if (!data.name || !data.slug || !data.imageUrl) {
            throw new Error("Missing required fields");
        }
        return this.destinationRepository.createDestination(data);
    }
    async updateDestination(id, data) {
        return this.destinationRepository.updateDestination(id, data);
    }
    async deleteDestination(id) {
        return this.destinationRepository.deleteDestination(id);
    }
    async toggleFeatured(id) {
        return this.destinationRepository.toggleFeatured(id);
    }
}
