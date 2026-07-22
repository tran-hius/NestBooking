import { z } from "zod/v3";
import { BedType } from "../../../../generated/prisma";

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

export type CreateRoomTypeDto = z.infer<typeof CreateRoomTypeSchema>["body"];
export type UpdateRoomTypeDto = z.infer<typeof UpdateRoomTypeSchema>["body"];
export type AddRoomTypeImagesDto = z.infer<typeof AddRoomTypeImagesSchema>["body"];

export interface RoomTypeResponseDto {
  id: string;
  hotelId: string;
  name: string;
  description: string | null;
  price: number;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  bedType: BedType;
  bedCount: number;
  area: number | null;
  thumbnail: string | null;
  isActive: boolean;
  amenities: string[];
  totalRooms?: number;
  createdAt: Date;
  updatedAt: Date;
  images?: { id: string; imageUrl: string }[];
}
