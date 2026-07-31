import { NotFoundError, ForbiddenError } from "../../../utils/errors/index.js";
import { ReviewMapper } from "../mapper/reviewMapper.js";
export class ReviewService {
    reviewRepository;
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async createReview(userId, data) {
        // In a real application, you might want to verify if the user actually stayed at the hotel
        const review = await this.reviewRepository.create({
            userId,
            hotelId: data.hotelId,
            rating: data.rating,
            comment: data.comment,
        });
        return ReviewMapper.toResponseDto(review);
    }
    async getHotelReviews(hotelId) {
        const reviews = await this.reviewRepository.findByHotel(hotelId);
        return ReviewMapper.toResponseDtoList(reviews);
    }
    async updateReview(id, userId, data) {
        const existingReview = await this.reviewRepository.findById(id);
        if (!existingReview)
            throw new NotFoundError("Review not found");
        if (existingReview.userId !== userId)
            throw new ForbiddenError("You can only edit your own review");
        const updatedReview = await this.reviewRepository.update(id, data);
        return ReviewMapper.toResponseDto(updatedReview);
    }
    async deleteReview(id, userId) {
        const review = await this.reviewRepository.findById(id);
        if (!review)
            throw new NotFoundError("Review not found");
        // Admin check could be done at controller level
        if (review.userId !== userId)
            throw new ForbiddenError("You can only delete your own review");
        await this.reviewRepository.delete(id);
    }
}
