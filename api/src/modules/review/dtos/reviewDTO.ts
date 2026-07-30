import { z } from "zod";

export const CreateReviewSchema = z.object({
  body: z.object({
    hotelId: z.string().uuid("hotelId phải là UUID hợp lệ"),
    rating: z.number().min(1, "Rating thấp nhất là 1").max(5, "Rating lớn nhất là 5"),
    comment: z.string().optional(),
  }),
});
export type CreateReviewDto = z.infer<typeof CreateReviewSchema>["body"];

export const UpdateReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1, "Rating thấp nhất là 1").max(5, "Rating lớn nhất là 5").optional(),
    comment: z.string().optional(),
  }),
});
export type UpdateReviewDto = z.infer<typeof UpdateReviewSchema>["body"];

export interface ReviewResponseDto {
  id: string;
  hotelId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

