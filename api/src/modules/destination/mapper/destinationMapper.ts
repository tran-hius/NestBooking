import { Destination } from "../../../../generated/prisma";
import { DestinationResponseDto } from "../dtos/destinationDto";

export class DestinationMapper {
  static toResponseDto(destination: Destination): DestinationResponseDto {
    return {
      id: destination.id,
      name: destination.name,
      slug: destination.slug,
      description: destination.description,
      imageUrl: destination.imageUrl,
      country: destination.country,
      countryFlag: destination.countryFlag,
      isFeatured: destination.isFeatured,
      isActive: destination.isActive,
      createdAt: destination.createdAt,
      updatedAt: destination.updatedAt,
    };
  }

  static toResponseDtoList(destinations: Destination[]): DestinationResponseDto[] {
    return destinations.map((destination) => this.toResponseDto(destination));
  }
}
