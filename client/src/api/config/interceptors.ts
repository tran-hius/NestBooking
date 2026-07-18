import { AxiosInstance } from 'axios';
import axios from 'axios';
import { useAppStore } from '../../stores/useAppStore'; 
import { API_ENDPOINTS } from '../constants/endpoints';

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Lấy Token trực tiếp từ Zustand Store
      // Ở đây chúng ta bọc trong try/catch hoặc check null nếu store chưa khởi tạo kịp
      const state = useAppStore.getState();
      if (state && state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshTokenUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${API_ENDPOINTS.AUTH.REFRESH}`;
          
          const response = await axios.post(refreshTokenUrl, {}, {
            withCredentials: true 
          });

          const newAccessToken = response.data?.data?.tokens?.accessToken;
          if (!newAccessToken) throw new Error("No access token returned");
          useAppStore.getState().setToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          useAppStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};
