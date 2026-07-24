import express from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middlewares/validationMiddleware";

import { SearchRepository } from "../repositories/SearchRepository";
import { SearchService } from "../services/SearchService";
import { SearchController } from "../controllers/SearchController";
import { searchHotelSchema } from "../dtos/SearchDTO";

const router = express.Router();


const searchRepository = new SearchRepository(prisma);
const searchService = new SearchService(searchRepository);
const searchController = new SearchController(searchService);


router.get(
  "/hotels",
  validate(searchHotelSchema),
  asyncHandler(searchController.searchHotels),
);

export default router;
