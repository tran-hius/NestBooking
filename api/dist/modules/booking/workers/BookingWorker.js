import logger from "../../../config/logger.js";
import { prisma } from "../../../config/prisma.js";
import { rabbitmq } from "../../../infrastructure/rabbitmq/rabbitMQ.js";
import { QUEUES } from "../../../infrastructure/rabbitmq/queues.js";
import { EXCHANGES } from "../../../infrastructure/rabbitmq/exchanges.js";
import { ROUTING_KEYS } from "../../../infrastructure/rabbitmq/routing.key.js";
import { BookingStatus } from "../../../../generated/prisma/index.js";
const MAX_RETRY = 3;
export const startBookingWorker = async () => {
    logger.info(`Booking Worker đang lắng nghe Queue: ${QUEUES.BOOKING}`);
    await rabbitmq.consumeQueue(QUEUES.BOOKING, async (msg, channel) => {
        if (!msg) {
            logger.warn("Nhận được message rỗng ở Booking Worker.");
            return;
        }
        const retries = Number(msg.properties.headers?.["x-retries"] ?? 0);
        let payload;
        try {
            payload = JSON.parse(msg.content.toString());
            if (!payload.bookingId)
                throw new Error("Payload thiếu bookingId.");
        }
        catch (error) {
            logger.error("Payload RabbitMQ Booking không hợp lệ.", error);
            channel.nack(msg, false, false);
            return;
        }
        const { bookingId } = payload;
        try {
            logger.info(`[Booking Worker] Đang xử lý đơn đặt phòng: ${bookingId} (Retry ${retries}/${MAX_RETRY})`);
            await prisma.$transaction(async (tx) => {
                const bookings = await tx.$queryRaw `
          SELECT id, "roomTypeId", status, quantity, check_in_date AS "checkInDate", check_out_date AS "checkOutDate", special_requests AS "specialRequests", guest_email AS "guestEmail", booking_code AS "bookingCode"
          FROM bookings 
          WHERE id = ${bookingId}::uuid 
          FOR UPDATE
        `;
                if (bookings.length === 0)
                    return;
                const booking = bookings[0];
                if (booking.status !== BookingStatus.PENDING)
                    return;
                const roomTypes = await tx.$queryRaw `
          SELECT 1 FROM room_types WHERE id = ${booking.roomTypeId}::uuid FOR UPDATE
        `;
                if (roomTypes.length === 0)
                    throw new Error("RoomType not found");
                const totalPhysicalRooms = await tx.room.count({
                    where: { roomTypeId: booking.roomTypeId, isActive: true }
                });
                const overlappingBookings = await tx.booking.aggregate({
                    _sum: { quantity: true },
                    where: {
                        roomTypeId: booking.roomTypeId,
                        status: { in: [BookingStatus.CONFIRMED] },
                        NOT: {
                            OR: [
                                { checkOutDate: { lte: booking.checkInDate } },
                                { checkInDate: { gte: booking.checkOutDate } }
                            ]
                        }
                    }
                });
                const availableRooms = totalPhysicalRooms - (overlappingBookings._sum.quantity || 0);
                if (availableRooms >= booking.quantity) {
                    await tx.booking.update({
                        where: { id: bookingId },
                        data: { status: BookingStatus.CONFIRMED }
                    });
                    logger.info(`[Booking Worker] Đơn ${bookingId} THÀNH CÔNG.`);
                    if (booking.guestEmail) {
                        const emailPayload = Buffer.from(JSON.stringify({
                            type: "SUCCESS",
                            to: booking.guestEmail,
                            bookingCode: booking.bookingCode,
                            checkInDate: booking.checkInDate,
                            checkOutDate: booking.checkOutDate
                        }));
                        channel.publish(EXCHANGES.NOTIFICATION_DIRECT, ROUTING_KEYS.EMAIL_BOOKING_SUCCESS, emailPayload, { persistent: true });
                    }
                }
                else {
                    const cancelReason = "Hệ thống tự động hủy vì đã hết phòng trống.";
                    await tx.booking.update({
                        where: { id: bookingId },
                        data: {
                            status: BookingStatus.CANCELLED,
                            specialRequests: (booking.specialRequests || "") + `\n[HỆ THỐNG]: ${cancelReason}`
                        }
                    });
                    logger.info(`[Booking Worker] Đơn ${bookingId} THẤT BẠI (Hết phòng).`);
                    if (booking.guestEmail) {
                        const emailPayload = Buffer.from(JSON.stringify({
                            type: "FAIL",
                            to: booking.guestEmail,
                            bookingCode: booking.bookingCode,
                            reason: cancelReason
                        }));
                        channel.publish(EXCHANGES.NOTIFICATION_DIRECT, ROUTING_KEYS.EMAIL_BOOKING_FAIL, emailPayload, { persistent: true });
                    }
                }
            });
            channel.ack(msg);
        }
        catch (error) {
            logger.error(`[Booking Worker] Lỗi xử lý đơn ${bookingId}`, error);
            if (retries >= MAX_RETRY) {
                logger.error(`Đơn ${bookingId} đã retry ${MAX_RETRY} lần. Rớt vào DLQ.`);
                channel.nack(msg, false, false);
                return;
            }
            logger.warn(`Retry lần ${retries + 1}/${MAX_RETRY} cho đơn ${bookingId}`);
            const content = Buffer.from(JSON.stringify(payload));
            channel.publish(EXCHANGES.BOOKING, ROUTING_KEYS.BOOKING_CREATE, content, {
                headers: { "x-retries": retries + 1 },
                persistent: true,
            });
            channel.ack(msg);
        }
    }, 1);
};
