import { z } from "zod/v3";

export const CreateDestinationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Tên điểm đến không được để trống.")
      .max(100, "Tên điểm đến tối đa 100 ký tự."),

    slug: z
      .string()
      .trim()
      .min(1, "Slug không được để trống.")
      .max(100, "Slug tối đa 100 ký tự."),

    imageUrl: z.string().trim().url("Đường dẫn ảnh không hợp lệ."),

    country: z
      .string()
      .trim()
      .max(100, "Tên quốc gia tối đa 100 ký tự.")
      .default("Vietnam"),

    countryFlag: z
      .string()
      .trim()
      .max(10, "Quốc kỳ không hợp lệ.")
      .default("🇻🇳"),

    description: z.string().trim().optional(),

    isActive: z.boolean().optional(),

    isFeatured: z.boolean().optional(),
  }),
});

export const UpdateDestinationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Tên điểm đến không được để trống.")
      .max(100, "Tên điểm đến tối đa 100 ký tự.")
      .optional(),

    slug: z
      .string()
      .trim()
      .min(1, "Slug không được để trống.")
      .max(100, "Slug tối đa 100 ký tự.")
      .optional(),

    imageUrl: z.string().trim().url("Đường dẫn ảnh không hợp lệ.").optional(),

    country: z
      .string()
      .trim()
      .max(100, "Tên quốc gia tối đa 100 ký tự.")
      .optional(),

    countryFlag: z.string().trim().max(10, "Quốc kỳ không hợp lệ.").optional(),

    description: z.string().trim().optional(),

    isActive: z.boolean().optional(),

    isFeatured: z.boolean().optional(),
  }),
});

export type CreateDestinationDto = z.infer<
  typeof CreateDestinationSchema
>["body"];

export type UpdateDestinationDto = z.infer<
  typeof UpdateDestinationSchema
>["body"];

export interface DestinationResponseDto {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  country: string;
  countryFlag: string;
  description: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}