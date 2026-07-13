import express from "express";
import { prisma } from "@/config/prisma";
import { UserRepository } from "@/modules/user/repositories/UserRepository";
import { UserService } from "@/modules/user/services/UserService";
import { UserController } from "@/modules/user/controllers/UserController";
import { asyncHandler } from "@/utils/asyncHandler";


import {
  validate,
  roleMiddleware,
  authMiddleware,
  requireOwnershipOrAdmin,
} from "@/middlewares";


import {
  UserIdParamSchema,
  CreateUserSchema,
  UpdateUserProfileSchema,
  SubmitIdentityVerificationSchema,
  ChangeUserStatusSchema,
  RejectIdentityVerificationSchema,
} from "../dtos/UserDTO";
import { Role } from "../../../../generated/prisma";

const router = express.Router();

const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// =====================================================
// GET ALL USERS
// =====================================================
router.get(
  "/",
  /*
    #swagger.path = '/api/users'
    #swagger.tags = ['Users']
    #swagger.summary = 'Lấy danh sách tất cả người dùng'
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  asyncHandler(userController.getAllUsers),
);

// =====================================================
// GET USER BY ID
// =====================================================
router.get(
  "/:id",
  /*
    #swagger.path = '/api/users/{id}'
    #swagger.tags = ['Users']
    #swagger.summary = 'Lấy chi tiết một người dùng theo ID'
  */
  authMiddleware,
  requireOwnershipOrAdmin,
  validate(UserIdParamSchema),
  asyncHandler(userController.getUserById),
);

// =====================================================
// CREATE USER
// =====================================================
router.post(
  "/",
  /*
    #swagger.path = '/api/users'
    #swagger.tags = ['Users']
    #swagger.summary = 'Tạo tài khoản người dùng mới'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/CreateUserDto"
          }
        }
      }
    }
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate(CreateUserSchema),
  asyncHandler(userController.createUser),
);

// =====================================================
// UPDATE PROFILE
// =====================================================
router.put(
  "/:id/profile",
  /*
    #swagger.path = '/api/users/{id}/profile'
    #swagger.tags = ['Users']
    #swagger.summary = 'Cập nhật thông tin hồ sơ cá nhân'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/UpdateUserProfileDto"
          }
        }
      }
    }
  */
  authMiddleware,
  requireOwnershipOrAdmin,
  validate(UserIdParamSchema),
  validate(UpdateUserProfileSchema),
  asyncHandler(userController.updateProfile),
);

// =====================================================
// CHANGE STATUS
// =====================================================
router.patch(
  "/:id/status",
  /*
    #swagger.path = '/api/users/{id}/status'
    #swagger.tags = ['Users']
    #swagger.summary = 'Thay đổi trạng thái tài khoản'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/ChangeUserStatusDto"
          }
        }
      }
    }
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate(UserIdParamSchema),
  validate(ChangeUserStatusSchema),
  asyncHandler(userController.changeUserStatus),
);

// =====================================================
// SOFT DELETE
// =====================================================
router.delete(
  "/:id",
  /*
    #swagger.path = '/api/users/{id}'
    #swagger.tags = ['Users']
    #swagger.summary = 'Xóa mềm tài khoản'
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate(UserIdParamSchema),
  asyncHandler(userController.softDeleteUser),
);

// =====================================================
// RESTORE USER
// =====================================================
router.post(
  "/:id/restore",
  /*
    #swagger.path = '/api/users/{id}/restore'
    #swagger.tags = ['Users']
    #swagger.summary = 'Khôi phục tài khoản đã bị xóa mềm'
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate(UserIdParamSchema),
  asyncHandler(userController.restoreUser),
);

// =====================================================
// SUBMIT KYC
// =====================================================
router.post(
  "/:id/kyc/submit",
  /*
    #swagger.path = '/api/users/{id}/kyc/submit'
    #swagger.tags = ['Users']
    #swagger.summary = 'Gửi hồ sơ KYC'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/SubmitIdentityVerificationDto"
          }
        }
      }
    }
  */
  authMiddleware,
  requireOwnershipOrAdmin,
  validate(UserIdParamSchema),
  validate(SubmitIdentityVerificationSchema),
  asyncHandler(userController.submitIdentityVerification),
);

// =====================================================
// APPROVE KYC
// =====================================================
router.patch(
  "/:id/kyc/approve",
  /*
    #swagger.path = '/api/users/{id}/kyc/approve'
    #swagger.tags = ['Users']
    #swagger.summary = 'Admin duyệt hồ sơ KYC'
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate(UserIdParamSchema),
  asyncHandler(userController.approveIdentityVerification),
);

// =====================================================
// REJECT KYC
// =====================================================
router.patch(
  "/:id/kyc/reject",
  /*
    #swagger.path = '/api/users/{id}/kyc/reject'
    #swagger.tags = ['Users']
    #swagger.summary = 'Admin từ chối hồ sơ KYC'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/RejectIdentityVerificationDto"
          }
        }
      }
    }
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate(UserIdParamSchema),
  validate(RejectIdentityVerificationSchema),
  asyncHandler(userController.rejectIdentityVerification),
);

export default router;
