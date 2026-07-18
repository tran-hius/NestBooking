import { axiosClient } from "@/api/config/axiosClient";
import { API_ENDPOINTS } from "@/api/constants/endpoints";

class UserService {
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
}

export const userService = new UserService();
