import { axiosClient } from "@/api/config/axiosClient";
import { API_ENDPOINTS } from "@/api/constants/endpoints";

enum Role {
  USER = "USER",
  AGENT = "AGENT",
  ADMIN = "ADMIN"
}

enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  REJECTED = "REJECTED",
  BANNED = "BANNED"
}

interface User {
  id: string,
  email: string,
  role: Role,
  status: UserStatus,
  createdAt: Date,
}

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
}

export const userService = new UserService();
