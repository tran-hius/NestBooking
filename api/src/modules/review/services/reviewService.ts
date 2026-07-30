import { IReviewService } from "../interfaces/iReviewService";
import { IReviewRepository } from "../interfaces/iReviewRepository";
import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto } from "../dtos/reviewDTO";
import { NotFoundError, ForbiddenError } from "@/utils/errors";
import { ReviewMapper } from "../mapper/reviewMapper";

export class ReviewService implements IReviewService {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async createReview(userId: string, data: CreateReviewDto): Promise<ReviewResponseDto> {
    // In a real application, you might want to verify if the user actually stayed at the hotel
    const review = await this.reviewRepository.create({
      userId,
      hotelId: data.hotelId,
      rating: data.rating,
      comment: data.comment,
    });
    return ReviewMapper.toResponseDto(review);
  }

  async getHotelReviews(hotelId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.findByHotel(hotelId);
    return ReviewMapper.toResponseDtoList(reviews);
  }

  async updateReview(id: string, userId: string, data: UpdateReviewDto): Promise<ReviewResponseDto> {
    const existingReview = await this.reviewRepository.findById(id);
    if (!existingReview) throw new NotFoundError("Review not found");
    if (existingReview.userId !== userId) throw new ForbiddenError("You can only edit your own review");

    const updatedReview = await this.reviewRepository.update(id, data);
    return ReviewMapper.toResponseDto(updatedReview);
  }

  async deleteReview(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) throw new NotFoundError("Review not found");
    // Admin check could be done at controller level
    if (review.userId !== userId) throw new ForbiddenError("You can only delete your own review");

    await this.reviewRepository.delete(id);
  }
}
