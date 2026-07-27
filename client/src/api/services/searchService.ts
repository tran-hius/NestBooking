import { axiosClient } from "@/api/config/axiosClient";
import { ApiResponse } from "@/api/types/apiResponse";

export interface SearchHotelsParams {
  city?: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: string;
}

export const searchService = {
  searchHotels: async (params: SearchHotelsParams): Promise<ApiResponse> => {
    return await axiosClient.get('/search/hotels', { params });
  },
  
  getSearchSuggestions: async (query: string): Promise<ApiResponse> => {
    return await axiosClient.get('/search/suggestions', { params: { q: query } });
  }
};
