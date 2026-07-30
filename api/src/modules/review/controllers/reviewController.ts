import { Request, Response } from "express";
import { IReviewService } from "../interfaces/iReviewService";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import { CreateReviewDto, UpdateReviewDto } from "../dtos/reviewDTO";

export class ReviewController {
  constructor(private readonly reviewService: IReviewService) {}

  createReview = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const body = req.body as CreateReviewDto;
    const review = await this.reviewService.createReview(userId, body);
    successResponse(res, HttpStatus.CREATED, "Đánh giá thành công", review);
  };

  getHotelReviews = async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId as string;
    const reviews = await this.reviewService.getHotelReviews(hotelId);
    successResponse(res, HttpStatus.OK, "Lấy đánh giá thành công", reviews);
  };

  updateReview = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const body = req.body as UpdateReviewDto;
    const review = await this.reviewService.updateReview(id, userId, body);
    successResponse(res, HttpStatus.OK, "Cập nhật đánh giá thành công", review);
  };

  deleteReview = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    await this.reviewService.deleteReview(id, userId);
    successResponse(res, HttpStatus.OK, "Xóa đánh giá thành công", null);
  };
}
