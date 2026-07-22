import { RoomResponseDto } from "../dtos/RoomDTO";

export class RoomMapper {
  public static toResponseDto(room: any): RoomResponseDto {
    return {
      id: room.id,
      hotelId: room.hotelId,
      roomTypeId: room.roomTypeId,
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      note: room.note,
      isActive: room.isActive,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  public static toResponseDtoList(rooms: any[]): RoomResponseDto[] {
    return rooms.map((room) => this.toResponseDto(room));
  }
}
