import api from "@/api";
import { ApiResponse } from "@/api/types/apiResponse";
import { BedType, RoomType } from "@/types";

export interface RoomTypePayload {
  name: string;
  description?: string;
  price: number;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  bedType: BedType;
  bedCount: number;
  area?: number;
  thumbnail?: string;
  isActive?: boolean;
  amenities?: string[];
}

export const roomTypeService = {
  getByHotel: (hotelId: string): Promise<ApiResponse<RoomType[]>> => api.get(`/room-types/hotel/${hotelId}`),
  create: (hotelId: string, payload: RoomTypePayload): Promise<ApiResponse<RoomType>> => api.post(`/room-types/${hotelId}`, payload),
  update: (id: string, payload: Partial<RoomTypePayload>): Promise<ApiResponse<RoomType>> => api.put(`/room-types/${id}`, payload),
  remove: (id: string): Promise<ApiResponse<void>> => api.delete(`/room-types/${id}`),
  addImages: (id: string, imageUrls: string[]): Promise<ApiResponse<void>> => api.post(`/room-types/${id}/images`, { imageUrls }),
  deleteImage: (imageId: string): Promise<ApiResponse<void>> => api.delete(`/room-types/images/${imageId}`),
};
