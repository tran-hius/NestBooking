import { ReviewResponseDto } from "../dtos/reviewDTO";
import { Review } from "#generated/prisma";

export class ReviewMapper {
  public static toResponseDto(review: Review): ReviewResponseDto {
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

  public static toResponseDtoList(reviews: Review[]): ReviewResponseDto[] {
    return reviews.map((review) => this.toResponseDto(review));
  }
}
