import { NotFoundError, ForbiddenError } from "@/utils/errors";
import { ReviewMapper } from "../mapper/reviewMapper";
import { redisClient, REDIS_KEYS, REDIS_TTL } from "@/infrastructure/redis";
import logger from "@/config/logger";
export class ReviewService {
    reviewRepository;
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async invalidateCache(hotelId) {
        await redisClient.del(REDIS_KEYS.REVIEWS_HOTEL(hotelId));
    }
    async createReview(userId, data) {
        const review = await this.reviewRepository.create({
            userId,
            hotelId: data.hotelId,
            rating: data.rating,
            comment: data.comment,
        });
        await this.invalidateCache(data.hotelId);
        return ReviewMapper.toResponseDto(review);
    }
    async getHotelReviews(hotelId) {
        const cacheKey = REDIS_KEYS.REVIEWS_HOTEL(hotelId);
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            logger.debug(`[Cache Hit] Lấy danh sách đánh giá của hotel ${hotelId} từ Redis`);
            return JSON.parse(cached);
        }
        logger.debug(`[Cache Miss] Tìm danh sách đánh giá của hotel ${hotelId} trong Database`);
        const reviews = await this.reviewRepository.findByHotel(hotelId);
        const result = ReviewMapper.toResponseDtoList(reviews);
        await redisClient.setex(cacheKey, REDIS_TTL.REVIEW, JSON.stringify(result));
        return result;
    }
    async updateReview(id, userId, data) {
        const existingReview = await this.reviewRepository.findById(id);
        if (!existingReview)
            throw new NotFoundError("Review not found");
        if (existingReview.userId !== userId)
            throw new ForbiddenError("You can only edit your own review");
        const updatedReview = await this.reviewRepository.update(id, data);
        await this.invalidateCache(updatedReview.hotelId);
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
        await this.invalidateCache(review.hotelId);
    }
}
