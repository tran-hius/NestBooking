import { IDestinationService } from "../interfaces/IDestinationService";
import { IDestinationRepository } from "../interfaces/IDestinationRepository";
import {
  CreateDestinationDto,
  DestinationResponseDto,
  UpdateDestinationDto,
} from "../dtos/DestinationDto";

export class DestinationService implements IDestinationService {
  constructor(private readonly destinationRepository: IDestinationRepository) {}

  async getActiveDestinations(): Promise<DestinationResponseDto[]> {
    return this.destinationRepository.getActiveDestinations();
  }

  async getAllDestinations(): Promise<DestinationResponseDto[]> {
    return this.destinationRepository.getAllDestinations();
  }

  async createDestination(
    data: CreateDestinationDto,
  ): Promise<DestinationResponseDto> {
    if (!data.name || !data.slug || !data.imageUrl) {
      throw new Error("Missing required fields");
    }

    return this.destinationRepository.createDestination(data);
  }

  async updateDestination(
    id: string,
    data: UpdateDestinationDto,
  ): Promise<DestinationResponseDto> {
    return this.destinationRepository.updateDestination(id, data);
  }

  async deleteDestination(id: string): Promise<void> {
    return this.destinationRepository.deleteDestination(id);
  }

  async toggleFeatured(id: string): Promise<DestinationResponseDto> {
    return this.destinationRepository.toggleFeatured(id);
  }
}
