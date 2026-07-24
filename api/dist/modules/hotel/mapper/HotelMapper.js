import { RoomTypeMapper } from "./RoomTypeMapper";
export class HotelMapper {
    static toResponseDto(hotel) {
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
            propertyType: hotel.propertyType,
            images: hotel.images || [],
            roomTypes: hotel.roomTypes ? RoomTypeMapper.toResponseDtoList(hotel.roomTypes) : [],
            createdAt: hotel.createdAt,
            updatedAt: hotel.updatedAt,
        };
    }
    static toResponseDtoList(hotels) {
        return hotels.map((hotel) => this.toResponseDto(hotel));
    }
}
