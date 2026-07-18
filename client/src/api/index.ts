import { axiosClient } from './config/axiosClient';
import { setupInterceptors } from './config/interceptors';

// Khởi tạo interceptors (nhúng logic Token vào Axios)
setupInterceptors(axiosClient);

// Export axiosClient để dùng cho các Service
export default axiosClient;

// Export lại toàn bộ các thư mục con để Component bên ngoài chỉ cần import từ '@/api'
export * from './constants/endpoints';
export * from './services/authService';
