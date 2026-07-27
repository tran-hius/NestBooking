import { AxiosInstance } from 'axios';
import axios from 'axios';
import { useAppStore } from '../../stores/useAppStore'; 
import { API_ENDPOINTS } from '../constants/endpoints';

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
  let isRefreshing = false;
  let failedQueue: any[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  axiosInstance.interceptors.request.use(
    (config) => {
      // Lấy Token trực tiếp từ Zustand Store
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
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshTokenUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${API_ENDPOINTS.AUTH.REFRESH}`;
          
          const response = await axios.post(refreshTokenUrl, {}, {
            withCredentials: true 
          });

          const newAccessToken = response.data?.data?.tokens?.accessToken;
          if (!newAccessToken) throw new Error("No access token returned");
          
          useAppStore.getState().setToken(newAccessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          useAppStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};
