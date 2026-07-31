import { axiosClient } from "@/api/config/axiosClient";
import { API_ENDPOINTS } from "@/api/constants/endpoints";
// import { User, Role, UserStatus } from "@/types";

class UserService {
  async getAllUsers() {
    return await axiosClient.get(API_ENDPOINTS.USER.ALL);
  }

  async uploadAvatar(userId: string, formData: FormData) {
    return await axiosClient.post(
      API_ENDPOINTS.USER.UPLOAD_AVATAR(userId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  }

  async updateProfile(userId: string, data: any) {
    return await axiosClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE(userId), data);
  }

  async updateUserAdmin(userId: string, data: any) {
    return await axiosClient.put(`/users/${userId}/admin`, data);
  }

  async updateStatus(userId: string, status: string) {
    return await axiosClient.patch(`/users/${userId}/status`, { status });
  }

  async createUser(data: any) {
    return await axiosClient.post("/users", data);
  }

  async deleteUser(userId: string) {
    return await axiosClient.delete(`/users/${userId}`);
  }
}

export const userService = new UserService();
