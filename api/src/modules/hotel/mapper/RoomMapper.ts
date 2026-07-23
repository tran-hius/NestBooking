import { RoomResponseDto } from "../dtos/RoomDTO";

import { Prisma, Room } from "#generated/prisma";

export class RoomMapper {
  public static toResponseDto(room: Room): RoomResponseDto {
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

  public static toResponseDtoList(rooms: Room[]): RoomResponseDto[] {
    return rooms.map((room) => this.toResponseDto(room));
  }
}
