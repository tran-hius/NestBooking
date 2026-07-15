import { HotelResponseDto } from "../dtos/hotelDto";

export class HotelMapper {
  public static toResponseDto(hotel: any): HotelResponseDto {
    return {
      id: hotel.id,
      ownerId: hotel.ownerId,
      name: hotel.name,
      slug: hotel.slug,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,

      latitude: hotel.latitude ? Number(hotel.latitude) : null,
      longitude: hotel.longitude ? Number(hotel.longitude) : null,

      phone: hotel.phone,
      email: hotel.email,
      thumbnail: hotel.thumbnail,
      amenities: hotel.amenities || [],
      rating: hotel.rating,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      status: hotel.status,
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt,

    };
  }


  public static toResponseDtoList(hotels: any[]): HotelResponseDto[] {
    return hotels.map((hotel) => this.toResponseDto(hotel));
  }
}
