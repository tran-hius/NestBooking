import { 
  CreateRoomTypeDto, 
  UpdateRoomTypeDto, 
  AddRoomTypeImagesDto, 
  RoomTypeResponseDto 
} from "../dtos/roomTypeDTO";

export interface IRoomTypeService {
  createRoomType(
    ownerId: string,
    hotelId: string,
    data: CreateRoomTypeDto,
  ): Promise<RoomTypeResponseDto>;
  updateRoomType(
    ownerId: string,
    id: string,
    data: UpdateRoomTypeDto,
  ): Promise<RoomTypeResponseDto>;
  deleteRoomType(ownerId: string, id: string): Promise<void>;
  getRoomTypeById(id: string, tx?: any): Promise<RoomTypeResponseDto | null>;
  getRoomTypesByHotel(hotelId: string): Promise<RoomTypeResponseDto[]>;
  getPublicRoomTypesByHotel(hotelId: string): Promise<RoomTypeResponseDto[]>;

  addRoomTypeImages(
    ownerId: string,
    roomTypeId: string,
    data: AddRoomTypeImagesDto,
  ): Promise<void>;
  deleteRoomTypeImage(ownerId: string, imageId: string): Promise<void>;
}
