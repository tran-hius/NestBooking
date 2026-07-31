import { axiosClient } from "@/api/config/axiosClient";
import { ApiResponse } from "@/api/types/apiResponse";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "BOOKING_SUCCESS" | "BOOKING_CANCELLED" | "SYSTEM" | "PROMOTION";
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getMine: (): Promise<ApiResponse<Notification[]>> => axiosClient.get("/notifications"),
  markAsRead: (id: string): Promise<ApiResponse<Notification>> => axiosClient.patch(`/notifications/${id}/read`),
  markAllAsRead: (): Promise<ApiResponse<void>> => axiosClient.patch("/notifications/read-all"),
};
