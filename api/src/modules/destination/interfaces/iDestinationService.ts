import {
  CreateDestinationDto,
  DestinationResponseDto,
  UpdateDestinationDto,
} from "../dtos/destinationDto";

export interface IDestinationService {
  getActiveDestinations(): Promise<DestinationResponseDto[]>;

  getAllDestinations(): Promise<DestinationResponseDto[]>;

  createDestination(
    data: CreateDestinationDto,
  ): Promise<DestinationResponseDto>;

  updateDestination(
    id: string,
    data: UpdateDestinationDto,
  ): Promise<DestinationResponseDto>;

  deleteDestination(id: string): Promise<void>;

  toggleFeatured(id: string): Promise<DestinationResponseDto>;
}
