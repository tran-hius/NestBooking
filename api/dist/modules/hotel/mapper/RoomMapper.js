export class RoomMapper {
    static toResponseDto(room) {
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
    static toResponseDtoList(rooms) {
        return rooms.map((room) => this.toResponseDto(room));
    }
}
