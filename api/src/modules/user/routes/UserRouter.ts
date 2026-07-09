import express from "express";
import { prisma } from "../../../lib/prisma";
import { UserRepository } from "../repositories/UserRepository";
import { UserService } from "../services/UserService";
import { UserController } from "../controllers/UserController";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = express.Router();

const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// =========================================================================
// 1. QUẢN LÝ TÀI KHOẢN CƠ BẢN (CRUD)
// =========================================================================
router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", asyncHandler(userController.getUserById));
router.post("/", asyncHandler(userController.createUser));
router.put("/:id/profile", asyncHandler(userController.updateProfile));
router.patch("/:id/status", asyncHandler(userController.changeUserStatus));

// =========================================================================
// 2. XỬ LÝ XÓA MỀM (SOFT DELETE & RESTORE)
// =========================================================================
router.delete("/:id", asyncHandler(userController.softDeleteUser));
router.post("/:id/restore", asyncHandler(userController.restoreUser));

// =========================================================================
// 3. QUẢN LÝ XÁC MINH DANH TÍNH AGENT (KYC)
// =========================================================================
router.post(
  "/:id/kyc/submit",
  asyncHandler(userController.submitIdentityVerification),
);
router.patch(
  "/:id/kyc/approve",
  asyncHandler(userController.approveIdentityVerification),
);
router.patch(
  "/:id/kyc/reject",
  asyncHandler(userController.rejectIdentityVerification),
);

export default router;
