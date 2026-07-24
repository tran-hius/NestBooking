import { z } from "zod/v3";
import { BookingStatus } from "../../../../generated/prisma";
export const CreateBookingSchema = z.object({
    body: z
        .object({
        hotelId: z.string().uuid("ID Khách sạn không hợp lệ"),
        roomTypeId: z.string().uuid("ID Loại phòng không hợp lệ"),
        checkInDate: z
            .string()
            .datetime({ message: "Ngày Check-in không hợp lệ" }),
        checkOutDate: z
            .string()
            .datetime({ message: "Ngày Check-out không hợp lệ" }),
        quantity: z.number().int().min(1, "Phải đặt ít nhất 1 phòng"),
        guestName: z.string().min(1, "Tên khách hàng không được để trống"),
        guestPhone: z.string().min(8, "Số điện thoại không hợp lệ"),
        guestEmail: z.string().email("Email không hợp lệ"),
        specialRequests: z.string().optional(),
    })
        .refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
        message: "Ngày Check-out phải sau ngày Check-in",
        path: ["checkOutDate"],
    }),
});
// Schema validate khi Agent / Lễ tân cập nhật trạng thái (Duyệt, Hoàn thành...)
export const UpdateBookingStatusSchema = z.object({
    body: z.object({
        status: z.nativeEnum(BookingStatus, {
            errorMap: () => ({ message: "Trạng thái không hợp lệ" }),
        }),
    }),
});
