import logger from "../../../config/logger.js";
import { successResponse } from "../../../utils/response.js";
import { HttpStatus } from "../../../constants/httpStatus.js";
import { BadRequestError } from "../../../utils/errors/index.js";
import { uploadToCloudinary } from "../../../utils/cloudinary.utils.js";
export class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    /**
     * GET /users
     */
    getAllUsers = async (_, res) => {
        logger.info("[UserController] Get all users");
        const users = await this.userService.getAllUsers();
        successResponse(res, HttpStatus.OK, "Lấy danh sách người dùng thành công.", users);
    };
    /**
     * GET /users/:id
     */
    getUserById = async (req, res) => {
        logger.info("[UserController] Get user by id", {
            userId: req.params.id,
        });
        const user = await this.userService.getUserById(req.params.id);
        successResponse(res, HttpStatus.OK, "Lấy thông tin người dùng thành công.", user);
    };
    /**
     * POST /users
     */
    createUser = async (req, res) => {
        logger.info("[UserController] Create user", {
            email: req.body.email,
        });
        const user = await this.userService.createUser(req.body);
        successResponse(res, HttpStatus.CREATED, "Tạo tài khoản thành công.", user);
    };
    /**
     * PUT /users/:id/profile
     */
    updateProfile = async (req, res) => {
        logger.info("[UserController] Update profile", {
            userId: req.params.id,
        });
        const user = await this.userService.updateProfile(req.params.id, req.body);
        successResponse(res, HttpStatus.OK, "Cập nhật hồ sơ thành công.", user);
    };
    /**
     * PATCH /users/:id/status
     */
    changeUserStatus = async (req, res) => {
        logger.info("[UserController] Change user status", {
            userId: req.params.id,
            status: req.body.status,
        });
        const user = await this.userService.changeUserStatus(req.params.id, req.body.status);
        successResponse(res, HttpStatus.OK, "Cập nhật trạng thái tài khoản thành công.", user);
    };
    // =========================================================================
    // PHẦN BỔ SUNG: CÁC HÀM CÒN THIẾU THEO SERVICE CỦA BẠN
    // =========================================================================
    /**
     * DELETE /users/:id
     * Xóa mềm người dùng
     */
    softDeleteUser = async (req, res) => {
        logger.warn("[UserController] Soft delete user", {
            userId: req.params.id,
        });
        await this.userService.softDeleteUser(req.params.id);
        successResponse(res, HttpStatus.OK, "Xóa tài khoản thành công (Xóa mềm).");
    };
    /**
     * POST /users/:id/restore
     * Khôi phục người dùng bị xóa mềm
     */
    restoreUser = async (req, res) => {
        logger.info("[UserController] Restore user", {
            userId: req.params.id,
        });
        const user = await this.userService.restoreUser(req.params.id);
        successResponse(res, HttpStatus.OK, "Khôi phục tài khoản thành công.", user);
    };
    /**
     * POST /users/:id/kyc/submit
     * Gửi hồ sơ xác minh danh tính Agent
     */
    submitIdentityVerification = async (req, res) => {
        logger.info("[UserController] Submit identity verification", {
            userId: req.params.id,
        });
        const user = await this.userService.submitIdentityVerification(req.params.id, req.body);
        successResponse(res, HttpStatus.OK, "Gửi hồ sơ xác minh danh tính thành công. Vui lòng chờ phê duyệt.", user);
    };
    /**
     * PATCH /users/:id/kyc/approve
     * Admin duyệt hồ sơ KYC
     */
    approveIdentityVerification = async (req, res) => {
        logger.info("[UserController] Approve identity verification", {
            userId: req.params.id,
        });
        const user = await this.userService.approveIdentityVerification(req.params.id);
        successResponse(res, HttpStatus.OK, "Phê duyệt hồ sơ đối tác thành công.", user);
    };
    /**
     * PATCH /users/:id/kyc/reject
     * Admin từ chối hồ sơ KYC
     */
    rejectIdentityVerification = async (req, res) => {
        logger.info("[UserController] Reject identity verification", {
            userId: req.params.id,
            reason: req.body.reason,
        });
        const user = await this.userService.rejectIdentityVerification(req.params.id, req.body.reason);
        successResponse(res, HttpStatus.OK, "Từ chối hồ sơ đối tác thành công.", user);
    };
    uploadAvatar = async (req, res) => {
        if (!req.file) {
            throw new BadRequestError("Vui lòng chọn một file ảnh để tải lên.");
        }
        const userId = req.user.userId;
        const publicId = `avatar_${userId}_${Date.now()}`;
        const imageUrl = await uploadToCloudinary(req.file.buffer, "booking-avatars", publicId);
        const updatedUser = await this.userService.updateProfile(userId, { avatarUrl: imageUrl });
        successResponse(res, HttpStatus.OK, "Cập nhật ảnh đại diện thành công!", updatedUser);
    };
}
