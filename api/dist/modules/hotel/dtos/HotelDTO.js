import { z } from "zod/v3";
import { HotelStatus, PropertyType } from "../../../../generated/prisma/index.js";
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
