import {
  CreateHotelDto,
  UpdateHotelDto,
  HotelResponseDto,
  AddHotelImagesDto,
} from "../dtos/HotelDTO";
import { PaginatedResponse } from "../dtos/PaginationDto";

export interface IHotelService {
  createHotel(ownerId: string, data: CreateHotelDto): Promise<HotelResponseDto>;
  getHotelsByAgent(
    ownerId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<HotelResponseDto>>;
  getHotelById(id: string, ownerId?: string): Promise<HotelResponseDto | null>;
  updateHotel(
    id: string,
    ownerId: string,
    data: UpdateHotelDto,
  ): Promise<HotelResponseDto>;
  softDeleteHotel(id: string, ownerId: string): Promise<void>;
  restoreHotel(id: string, ownerId: string): Promise<HotelResponseDto>;
  getAllHotels(
    query: any,
    page?: number, 
    limit?: number,
  ): Promise<PaginatedResponse<HotelResponseDto>>;
  addHotelImages(ownerId: string, hotelId: string, data: AddHotelImagesDto): Promise<void>;
  deleteHotelImage(ownerId: string, imageId: string): Promise<void>;
}
