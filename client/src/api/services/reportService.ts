import { axiosClient } from "@/api/config/axiosClient";
import { API_ENDPOINTS } from "@/api/constants/endpoints";

export const reportService = {
  getAllReports: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.REPORTS.ALL);
      return res || [];
    } catch (e) {
      console.warn("Report API not fully implemented yet on backend. Returning empty list.");
      return [];
    }
  }
};
