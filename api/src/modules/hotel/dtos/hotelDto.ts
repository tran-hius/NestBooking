import { z } from "zod/v3";
import { Hotel, HotelStatus, PropertyType } from "../../../../generated/prisma";

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
    amenities: z.array(z.string()).optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    propertyType: z
      .nativeEnum(PropertyType, { message: "Loại hình không hợp lệ." })
      .default(PropertyType.HOTEL),
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
    amenities: z.array(z.string()).optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    status: z
      .nativeEnum(HotelStatus, {
        message: "Trạng thái không hợp lệ.",
      })
      .optional(),
    propertyType: z.nativeEnum(PropertyType).optional(),
  }),
});

export const AddHotelImagesSchema = z.object({
  body: z.object({
    imageUrls: z.array(z.string().url("Link ảnh không hợp lệ")).min(1, "Phải có ít nhất 1 ảnh"),
  }),
});

export type CreateHotelDto = z.infer<typeof CreateHotelSchema>["body"];
export type UpdateHotelDto = z.infer<typeof UpdateHotelSchema>["body"];
export type AddHotelImagesDto = z.infer<typeof AddHotelImagesSchema>["body"];

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
  amenities: string[];
  rating: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: HotelStatus;
  propertyType: PropertyType;
  images?: { id: string; imageUrl: string }[];
  roomTypes?: any[];
  createdAt: Date;
  updatedAt: Date;
}
