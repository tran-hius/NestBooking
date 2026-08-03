import express from "express";
import { AiController } from "../controllers/aiController";
import { AiAnalyticsService } from "../services/aiAnalyticsService";
import { authMiddleware, roleMiddleware } from "@/middlewares";
import { Role } from "../../../../generated/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
// Import Repositories and Services for Dependency Injection
import { BookingReadRepository } from "../../booking/repositories/bookingReadRepository";
import { HotelRepository } from "../../hotel/repositories/hotelRepository";
import { HotelService } from "../../hotel/services/hotelService";
import { prisma } from "@/config/prisma";
import { UploadService } from "@/modules/upload/services/uploadService";
const router = express.Router();
// =====================================================
// KHỞI TẠO DEPENDENCY INJECTION (DI) NHƯ AUTH MODULE
// =====================================================
const uploadService = new UploadService();
const bookingReadRepo = new BookingReadRepository(prisma);
const hotelRepo = new HotelRepository(prisma);
const hotelService = new HotelService(hotelRepo, uploadService);
const aiAnalyticsService = new AiAnalyticsService(bookingReadRepo, hotelService);
const aiController = new AiController(aiAnalyticsService);
// =====================================================
// API: GET /api/ai/analytics/hotel/:hotelId
// =====================================================
router.get("/analytics/all", authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(aiController.analyzeAll));
router.get("/analytics/hotel/:hotelId", authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(aiController.analyzeHotel));
export default router;
