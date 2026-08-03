import { z } from "zod/v3";
import { RoomStatus } from "../../../../generated/prisma";
export const CreateRoomSchema = z.object({
    body: z.object({
        roomTypeId: z.string().uuid("ID loại phòng không hợp lệ"),
        roomNumber: z.string().min(1, "Số phòng không được để trống"),
        floor: z.number().int().optional(),
        status: z.nativeEnum(RoomStatus).optional(),
        note: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});
export const UpdateRoomSchema = z.object({
    body: z.object({
        roomNumber: z.string().min(1).optional(),
        floor: z.number().int().optional(),
        status: z.nativeEnum(RoomStatus).optional(),
        note: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});
