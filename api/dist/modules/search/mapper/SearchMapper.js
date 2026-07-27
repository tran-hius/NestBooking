export class SearchMapper {
    static toSearchResponseDto(hotel, availableRoomTypes, startingPrice) {
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
