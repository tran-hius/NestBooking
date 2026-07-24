import { SearchHotelPayload } from "../interfaces/ISearchRepository";
import {
  SearchHotelResponseDto,
  AvailableRoomTypeDto,
} from "../dtos/SearchDTO";

export class SearchMapper {
  static toSearchResponseDto(
    hotel: SearchHotelPayload,
    availableRoomTypes: AvailableRoomTypeDto[],
    startingPrice: number,
  ): SearchHotelResponseDto {
    return {
      id: hotel.id,
      name: hotel.name,
      slug: hotel.slug,
      address: hotel.address,
      city: hotel.city,
      thumbnail: hotel.thumbnail,
      rating: hotel.rating,
      propertyType: hotel.propertyType,
      amenities: hotel.amenities,
      images: hotel.images?.map((img) => img.imageUrl) || [],
      startingPrice,
      availableRoomTypes,
    };
  }
}
