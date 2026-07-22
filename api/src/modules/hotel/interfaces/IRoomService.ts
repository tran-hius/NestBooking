import { 
  CreateRoomDto, 
  UpdateRoomDto, 
  RoomResponseDto 
} from "../dtos/RoomDTO";

export interface IRoomService {
  createRoom(ownerId: string, hotelId: string, data: CreateRoomDto): Promise<RoomResponseDto>;
  updateRoom(ownerId: string, id: string, data: UpdateRoomDto): Promise<RoomResponseDto>;
  deleteRoom(ownerId: string, id: string): Promise<void>;
  getRoomById(id: string): Promise<RoomResponseDto | null>;
  getRoomsByHotel(hotelId: string): Promise<RoomResponseDto[]>;
  getRoomsByRoomType(roomTypeId: string): Promise<RoomResponseDto[]>;
}
