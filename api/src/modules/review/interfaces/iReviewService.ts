import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto } from "../dtos/reviewDTO";

export interface IReviewService {
  createReview(userId: string, data: CreateReviewDto): Promise<ReviewResponseDto>;
  getHotelReviews(hotelId: string): Promise<ReviewResponseDto[]>;
  updateReview(id: string, userId: string, data: UpdateReviewDto): Promise<ReviewResponseDto>;
  deleteReview(id: string, userId: string): Promise<void>;
}