import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
export class ReviewController {
    reviewService;
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    createReview = async (req, res) => {
        const userId = req.user.userId;
        const body = req.body;
        const review = await this.reviewService.createReview(userId, body);
        successResponse(res, HttpStatus.CREATED, "Đánh giá thành công", review);
    };
    getHotelReviews = async (req, res) => {
        const hotelId = req.params.hotelId;
        const reviews = await this.reviewService.getHotelReviews(hotelId);
        successResponse(res, HttpStatus.OK, "Lấy đánh giá thành công", reviews);
    };
    updateReview = async (req, res) => {
        const id = req.params.id;
        const userId = req.user.userId;
        const body = req.body;
        const review = await this.reviewService.updateReview(id, userId, body);
        successResponse(res, HttpStatus.OK, "Cập nhật đánh giá thành công", review);
    };
    deleteReview = async (req, res) => {
        const id = req.params.id;
        const userId = req.user.userId;
        await this.reviewService.deleteReview(id, userId);
        successResponse(res, HttpStatus.OK, "Xóa đánh giá thành công", null);
    };
}
