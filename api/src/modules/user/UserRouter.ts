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

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id/profile", userController.updateProfile);
router.patch("/:id/status", userController.changeUserStatus);

export default router;
