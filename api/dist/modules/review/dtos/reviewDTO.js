import { z } from "zod";
export const CreateReviewSchema = z.object({
    body: z.object({
        hotelId: z.string().uuid("hotelId phải là UUID hợp lệ"),
        rating: z.number().min(1, "Rating thấp nhất là 1").max(5, "Rating lớn nhất là 5"),
        comment: z.string().optional(),
    }),
});
export const UpdateReviewSchema = z.object({
    body: z.object({
        rating: z.number().min(1, "Rating thấp nhất là 1").max(5, "Rating lớn nhất là 5").optional(),
        comment: z.string().optional(),
    }),
});
