import { RoomTypeResponseDto } from "../dtos/RoomTypeDTO";

export class RoomTypeMapper {
  public static toResponseDto(roomType: any): RoomTypeResponseDto {
    return {
      id: roomType.id,
      hotelId: roomType.hotelId,
      name: roomType.name,
      description: roomType.description,
      price: roomType.price ? Number(roomType.price) : 0,
      maxGuests: roomType.maxGuests,
      maxAdults: roomType.maxAdults,
      maxChildren: roomType.maxChildren,
      bedType: roomType.bedType,
      bedCount: roomType.bedCount,
      area: roomType.area,
      thumbnail: roomType.thumbnail,
      isActive: roomType.isActive,
      amenities: roomType.amenities,
      totalRooms: roomType._count?.rooms,
      createdAt: roomType.createdAt,
      updatedAt: roomType.updatedAt,
      images: roomType.images ? roomType.images.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl
      })) : undefined,
    };
  }

  public static toResponseDtoList(roomTypes: any[]): RoomTypeResponseDto[] {
    return roomTypes.map((rt) => this.toResponseDto(rt));
  }
}
