import { Router } from "express";
import { DestinationController } from "../controllers/destinationController";
import { DestinationService } from "../services/destinationService";
import { DestinationRepository } from "../repositories/destinationRepository";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { roleMiddleware } from "@/middlewares/roleMiddleware";
import { upload } from "@/middlewares/uploadMiddleware";

import { UploadService } from "@/modules/upload/services/uploadService";

const router = Router();
const destinationRepository = new DestinationRepository();
const destinationService = new DestinationService(destinationRepository);
const uploadService = new UploadService();
const destinationController = new DestinationController(destinationService, uploadService);

router.get("/", destinationController.getActiveDestinations);

router.get("/all", authMiddleware, roleMiddleware(["ADMIN"]), destinationController.getAllDestinations);
router.post("/", authMiddleware, roleMiddleware(["ADMIN"]), upload.single("image"), destinationController.createDestination);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), destinationController.updateDestination);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), destinationController.deleteDestination);
router.patch("/:id/featured", authMiddleware, roleMiddleware(["ADMIN"]), destinationController.toggleFeatured);

export const DestinationRouter = router;
