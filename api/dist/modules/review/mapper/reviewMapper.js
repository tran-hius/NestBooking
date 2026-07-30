export class ReviewMapper {
    static toResponseDto(review) {
        return {
            id: review.id,
            hotelId: review.hotelId,
            userId: review.userId,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        };
    }
    static toResponseDtoList(reviews) {
        return reviews.map((review) => this.toResponseDto(review));
    }
}
