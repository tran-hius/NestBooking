import { z } from "zod";
import { NotificationType } from "#generated/prisma";
export const CreateNotificationSchema = z.object({
    body: z.object({
        userId: z.string().uuid("userId phải là UUID"),
        title: z.string().min(1, "Tiêu đề không được để trống").max(255),
        message: z.string().min(1, "Nội dung không được để trống"),
        type: z.nativeEnum(NotificationType).optional(),
    }),
});
