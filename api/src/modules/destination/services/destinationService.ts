import { IDestinationService } from "../interfaces/iDestinationService";
import { IDestinationRepository } from "../interfaces/iDestinationRepository";
import {
  CreateDestinationDto,
  DestinationResponseDto,
  UpdateDestinationDto,
} from "../dtos/destinationDto";
import { DestinationMapper } from "../mapper/destinationMapper";

export class DestinationService implements IDestinationService {
  constructor(private readonly destinationRepository: IDestinationRepository) {}

  async getActiveDestinations(): Promise<DestinationResponseDto[]> {
    const destinations = await this.destinationRepository.getActiveDestinations();
    return DestinationMapper.toResponseDtoList(destinations);
  }

  async getAllDestinations(): Promise<DestinationResponseDto[]> {
    const destinations = await this.destinationRepository.getAllDestinations();
    return DestinationMapper.toResponseDtoList(destinations);
  }

  async createDestination(
    data: CreateDestinationDto,
  ): Promise<DestinationResponseDto> {
    if (!data.name || !data.slug || !data.imageUrl) {
      throw new Error("Missing required fields");
    }

    const destination = await this.destinationRepository.createDestination(data);
    return DestinationMapper.toResponseDto(destination);
  }

  async updateDestination(
    id: string,
    data: UpdateDestinationDto,
  ): Promise<DestinationResponseDto> {
    const destination = await this.destinationRepository.updateDestination(id, data);
    return DestinationMapper.toResponseDto(destination);
  }

  async deleteDestination(id: string): Promise<void> {
    return this.destinationRepository.deleteDestination(id);
  }

  async toggleFeatured(id: string): Promise<DestinationResponseDto> {
    const destination = await this.destinationRepository.toggleFeatured(id);
    return DestinationMapper.toResponseDto(destination);
  }
}
