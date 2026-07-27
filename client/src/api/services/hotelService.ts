import api from "@/api";

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  description: string;
  propertyType: string;
  starRating: number;
  latitude: number;
  longitude: number;
  status: string;
  images: { id: string; imageUrl: string }[];
  roomTypes: RoomType[];
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  bedCount: number;
  area: number;
  hasWindow: boolean;
  hasBalcony: boolean;
  isActive: boolean;
}

export const hotelService = {
  getAllHotels: async (page = 1, limit = 10) => {
    const response = await api.get(`/hotels?page=${page}&limit=${limit}`);
    return response;
  },

  getHotelById: async (id: string) => {
    const response = await api.get(`/hotels/${id}`);
    return response;
  }
};
