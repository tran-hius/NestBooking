import {
  CreateHotelDto,
  UpdateHotelDto,
  HotelResponseDto,
} from "../dtos/hotelDto";

export interface IHotelService {
  createHotel(ownerId: string, data: CreateHotelDto): Promise<HotelResponseDto>;
  getHotelsByAgent(ownerId: string): Promise<HotelResponseDto[]>;
  getHotelById(id: string, ownerId?: string): Promise<HotelResponseDto | null>;
  updateHotel(
    id: string,
    ownerId: string,
    data: UpdateHotelDto,
  ): Promise<HotelResponseDto>;
  softDeleteHotel(id: string, ownerId: string): Promise<void>;
  restoreHotel(id: string, ownerId: string): Promise<HotelResponseDto>;
  getAllHotels(query: any): Promise<HotelResponseDto[]>;
}
