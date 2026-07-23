import { z } from "zod/v3";
import { BedType } from "../../../../generated/prisma/index.js";
export const CreateRoomTypeSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Tên loại phòng không được để trống"),
        description: z.string().optional(),
        price: z.number().min(0, "Giá không hợp lệ"),
        maxGuests: z.number().int().min(1),
        maxAdults: z.number().int().min(1),
        maxChildren: z.number().int().min(0),
        bedType: z.nativeEnum(BedType),
        bedCount: z.number().int().min(1),
        area: z.number().optional(),
        thumbnail: z.string().url("Link ảnh không hợp lệ").optional(),
        isActive: z.boolean().optional(),
        amenities: z.array(z.string()).optional(),
    }),
});
export const UpdateRoomTypeSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        maxGuests: z.number().int().min(1).optional(),
        maxAdults: z.number().int().min(1).optional(),
        maxChildren: z.number().int().min(0).optional(),
        bedType: z.nativeEnum(BedType).optional(),
        bedCount: z.number().int().min(1).optional(),
        area: z.number().optional(),
        thumbnail: z.string().url("Link ảnh không hợp lệ").optional(),
        isActive: z.boolean().optional(),
        amenities: z.array(z.string()).optional(),
    }),
});
export const AddRoomTypeImagesSchema = z.object({
    body: z.object({
        imageUrls: z.array(z.string().url("Link ảnh không hợp lệ")).min(1, "Phải có ít nhất 1 ảnh"),
    })
});
