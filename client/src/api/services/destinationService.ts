import api from "@/api";
import { ApiResponse } from "@/api/types/apiResponse";

export interface Destination {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  country: string;
  countryFlag: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export const destinationService = {
  getAllDestinations: (): Promise<ApiResponse<Destination[]>> => api.get('/destinations'),

  getAdminDestinations: (): Promise<ApiResponse<Destination[]>> => api.get('/destinations/all'),

  createDestination: async (data: FormData | Partial<Destination>) => {
    let response;
    if (data instanceof FormData) {
      response = await api.post('/destinations', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await api.post('/destinations', data);
    }
    return response;
  },

  updateDestination: async (id: string, data: Partial<Destination>) => {
    const response = await api.put(`/destinations/${id}`, data);
    return response;
  },

  deleteDestination: async (id: string) => {
    const response = await api.delete(`/destinations/${id}`);
    return response;
  },

  toggleFeatured: async (id: string) => {
    const response = await api.patch(`/destinations/${id}/featured`);
    return response;
  }
};
