import api from "@/api";
// import { Hotel, RoomType } from "@/types";

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
