import express from "express";
import { prisma } from "../../lib/prisma";
import { UserRepository } from "./UserRepository";
import { UserService } from "./UserService";
import { UserController } from "./UserController";
import { asyncHandler } from "../../utils/asyncHandler";
const router = express.Router();

const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", asyncHandler(userController.getUserById));
router.post("/", asyncHandler(userController.createUser));
router.put("/:id/profile", asyncHandler(userController.updateProfile));
router.patch("/:id/status", asyncHandler(userController.changeUserStatus));

export default router;
