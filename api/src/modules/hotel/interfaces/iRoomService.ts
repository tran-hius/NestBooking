import { 
  CreateRoomDto, 
  UpdateRoomDto, 
  RoomResponseDto 
} from "../dtos/roomDTO";

export interface IRoomService {
  createRoom(ownerId: string, hotelId: string, data: CreateRoomDto): Promise<RoomResponseDto>;
  updateRoom(ownerId: string, id: string, data: UpdateRoomDto): Promise<RoomResponseDto>;
  deleteRoom(ownerId: string, id: string): Promise<void>;
  getRoomById(id: string, ownerId?: string): Promise<RoomResponseDto | null>;
  getRoomsByHotel(hotelId: string, ownerId?: string): Promise<RoomResponseDto[]>;
  getRoomsByRoomType(roomTypeId: string, ownerId?: string): Promise<RoomResponseDto[]>;
  countActiveRoomsByRoomType(roomTypeId: string, tx?: any): Promise<number>;
}
