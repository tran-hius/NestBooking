import api from "@/api";
import { ApiResponse } from "@/api/types/apiResponse";
import { Hotel, PaginatedResponse, PropertyType } from "@/types";

export interface HotelPayload {
  name: string;
  description?: string;
  address: string;
  city: string;
  country?: string;
  phone?: string;
  email?: string;
  thumbnail?: string;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  propertyType?: PropertyType;
}

export const hotelService = {
  getAllHotels: (page = 1, limit = 10, status?: Hotel["status"]): Promise<ApiResponse<PaginatedResponse<Hotel>>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    return api.get(`/hotels?${params.toString()}`);
  },
  getAdminHotels: (page = 1, limit = 100): Promise<ApiResponse<PaginatedResponse<Hotel>>> => api.get(`/hotels/admin/all?page=${page}&limit=${limit}`),
  getMyHotels: (page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<Hotel>>> => api.get(`/hotels/my-hotels?page=${page}&limit=${limit}`),
  getHotelById: (id: string): Promise<ApiResponse<Hotel>> => api.get(`/hotels/${id}`),
  getManagedHotelById: (id: string): Promise<ApiResponse<Hotel>> => api.get(`/hotels/manage/${id}`),
  createHotel: (payload: HotelPayload): Promise<ApiResponse<Hotel>> => api.post("/hotels", payload),
  updateHotel: (id: string, payload: Partial<HotelPayload>): Promise<ApiResponse<Hotel>> => api.put(`/hotels/${id}`, payload),
  updateHotelStatus: (id: string, status: Hotel["status"]): Promise<ApiResponse<Hotel>> => api.patch(`/hotels/${id}/admin-status`, { status }),
  deleteHotel: (id: string): Promise<ApiResponse<void>> => api.delete(`/hotels/${id}`),
  addHotelImages: (id: string, files: File[]): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.post(`/hotels/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  deleteHotelImage: (imageId: string): Promise<ApiResponse<void>> => api.delete(`/hotels/images/${imageId}`),
};
