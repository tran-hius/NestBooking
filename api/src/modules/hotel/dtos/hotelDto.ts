import { z } from "zod/v3";
import { HotelStatus } from "../../../../generated/prisma"; 

export const CreateHotelSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Tên khách sạn không được để trống"),
    description: z.string().optional(),
    address: z.string().min(1, "Địa chỉ không được để trống"),
    city: z.string().min(1, "Thành phố không được để trống"),
    country: z.string().default("Vietnam").optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    phone: z.string().optional(),
    email: z.string().email("Email không hợp lệ").optional(),
    thumbnail: z.string().url("Link ảnh không hợp lệ").optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
  }),
});

export const UpdateHotelSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Tên khách sạn không được để trống").optional(),
    description: z.string().optional(),
    address: z.string().min(1, "Địa chỉ không được để trống").optional(),
    city: z.string().min(1, "Thành phố không được để trống").optional(),
    country: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    phone: z.string().optional(),
    email: z.string().email("Email không hợp lệ").optional(),
    thumbnail: z.string().url("Link ảnh không hợp lệ").optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    status: z
      .nativeEnum(HotelStatus, {
        message: "Trạng thái không hợp lệ.",
      })
      .optional(),
  }),
});

export type CreateHotelDto = z.infer<typeof CreateHotelSchema>["body"];
export type UpdateHotelDto = z.infer<typeof UpdateHotelSchema>["body"];

export interface HotelResponseDto {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  latitude: any | null; 
  longitude: any | null;
  phone: string | null;
  email: string | null;
  thumbnail: string | null;
  rating: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: HotelStatus;
  createdAt: Date;
  updatedAt: Date;
}
