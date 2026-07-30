import { DestinationMapper } from "../mapper/destinationMapper";
export class DestinationService {
    destinationRepository;
    constructor(destinationRepository) {
        this.destinationRepository = destinationRepository;
    }
    async getActiveDestinations() {
        const destinations = await this.destinationRepository.getActiveDestinations();
        return DestinationMapper.toResponseDtoList(destinations);
    }
    async getAllDestinations() {
        const destinations = await this.destinationRepository.getAllDestinations();
        return DestinationMapper.toResponseDtoList(destinations);
    }
    async createDestination(data) {
        if (!data.name || !data.slug || !data.imageUrl) {
            throw new Error("Missing required fields");
        }
        const destination = await this.destinationRepository.createDestination(data);
        return DestinationMapper.toResponseDto(destination);
    }
    async updateDestination(id, data) {
        const destination = await this.destinationRepository.updateDestination(id, data);
        return DestinationMapper.toResponseDto(destination);
    }
    async deleteDestination(id) {
        return this.destinationRepository.deleteDestination(id);
    }
    async toggleFeatured(id) {
        const destination = await this.destinationRepository.toggleFeatured(id);
        return DestinationMapper.toResponseDto(destination);
    }
}
