import express from "express";
import { prisma } from "@/config/prisma";
import { UserRepository } from "@/modules/user/repositories/userRepository";
import { UserService } from "@/modules/user/services/userService";
import { UserProfileService } from "@/modules/user/services/userProfileService";

import { UserController } from "@/modules/user/controllers/userController";
import { asyncHandler } from "@/utils/asyncHandler";
import { OtpService } from "@/modules/auth/services/otpService";
import { UploadService } from "@/modules/upload/services/uploadService";

import {
  validate,
  roleMiddleware,
  authMiddleware,
  requireOwnershipOrAdmin,
  upload
} from "@/middlewares";

import {
  UserIdParamSchema,
  CreateUserSchema,
  UpdateUserProfileSchema,
  SubmitIdentityVerificationSchema,
  ChangeUserStatusSchema,
  RejectIdentityVerificationSchema,
  UpdateUserAdminSchema,
} from "../dtos/userDTO";
import { Role } from "../../../../generated/prisma";

const router = express.Router();

const userRepository = new UserRepository(prisma);
const otpService = new OtpService();

const userService = new UserService(userRepository);
const userProfileService = new UserProfileService(userRepository);
const uploadService = new UploadService();
const userController = new UserController(userService, userProfileService, uploadService);

// =====================================================
// GET ALL USERS
// =====================================================
router.get(
  "/",
  /*
    #swagger.path = '/api/users'
    #swagger.tags = ['Users']
    #swagger.summary = 'Lấy danh sách tất cả người dùng'
    #swagger.security = [{ "bearerAuth": [] }]
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
    #swagger.security = [{ "bearerAuth": [] }]
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
// ADMIN UPDATE USER (Role, Status, FullName)
// =====================================================
router.put(
  "/:id/admin",
  /*
    #swagger.path = '/api/users/{id}/admin'
    #swagger.tags = ['Users']
    #swagger.summary = 'Admin cập nhật người dùng (Role, Status, FullName)'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID của người dùng',
        required: true,
        type: 'string'
    }
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        fullName: { type: "string" },
                        phoneNumber: { type: "string" },
                        address: { type: "string" },
                        role: { type: "string", enum: ["USER", "AGENT", "ADMIN"] },
                        status: { type: "string", enum: ["ACTIVE", "PENDING", "INACTIVE", "BANNED", "REJECTED"] },
                        businessName: { type: "string" },
                        businessLicense: { type: "string" },
                        taxCode: { type: "string" },
                        idNumber: { type: "string" },
                        idCardImageUrl: { type: "string" }
                    }
                }
            }
        }
    }
    #swagger.responses[200] = { description: 'Cập nhật thành công.' }
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate(UserIdParamSchema),
  validate(UpdateUserAdminSchema),
  asyncHandler(userController.updateUserAdmin),
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
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  requireOwnershipOrAdmin,`n  validate(UserIdParamSchema),`n  asyncHandler(userController.softDeleteUser),
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
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate(UserIdParamSchema),
  asyncHandler(userController.restoreUser),
);


router.post(
  "/:id/avatar",
  /*
    #swagger.path = '/api/users/{id}/avatar'
    #swagger.tags = ['Users']
    #swagger.summary = 'Tải lên ảnh đại diện (Avatar)'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              avatar: {
                type: "string",
                format: "binary",
                description: "File ảnh (jpg, png, jpeg, webp) tối đa 5MB"
              }
            }
          }
        }
      }
    }
  */
  authMiddleware,
  requireOwnershipOrAdmin,
  upload.single("avatar"),
  asyncHandler(userController.uploadAvatar),
);


export default router;
