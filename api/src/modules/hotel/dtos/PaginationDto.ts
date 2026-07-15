// Định dạng chung cho mọi API có phân trang
export interface PaginatedResponse<T> {
  data: T[]; // Mảng dữ liệu
  meta: {
    total: number; // Tổng số bản ghi trong DB
    page: number; // Trang hiện tại
    limit: number; // Số lượng trên 1 trang
    totalPages: number; // Tổng số trang
  };
}
