import api from "@/api";
import { ApiResponse } from "@/api/types/apiResponse";
import { Room, RoomStatus } from "@/types";

export interface RoomPayload {
  roomTypeId: string;
  roomNumber: string;
  floor?: number;
  status?: RoomStatus;
  note?: string;
  isActive?: boolean;
}

export const roomService = {
  getByHotel: (hotelId: string): Promise<ApiResponse<Room[]>> => api.get(`/rooms/hotel/${hotelId}`),
  create: (hotelId: string, payload: RoomPayload): Promise<ApiResponse<Room>> => api.post(`/rooms/${hotelId}`, payload),
  update: (id: string, payload: Partial<Omit<RoomPayload, "roomTypeId">>): Promise<ApiResponse<Room>> => api.put(`/rooms/${id}`, payload),
  remove: (id: string): Promise<ApiResponse<void>> => api.delete(`/rooms/${id}`),
};
