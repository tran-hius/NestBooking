import logger from "@/config/logger";
import { prisma } from "@/config/prisma";
import { rabbitmq } from "@/infrastructure/rabbitmq/rabbitMQ";
import { QUEUES } from "@/infrastructure/rabbitmq/queues";
import { EXCHANGES } from "@/infrastructure/rabbitmq/exchanges";
import { ROUTING_KEYS } from "@/infrastructure/rabbitmq/routing.key";
import { BookingStatus } from "../../../../generated/prisma";

const MAX_RETRY = 3;

export const startBookingWorker = async (): Promise<void> => {
  logger.info(`Booking Worker đang lắng nghe Queue: ${QUEUES.BOOKING}`);

  await rabbitmq.consumeQueue(QUEUES.BOOKING, async (msg, channel) => {
    if (!msg) {
      logger.warn("Nhận được message rỗng ở Booking Worker.");
      return;
    }

    const retries = Number(msg.properties.headers?.["x-retries"] ?? 0);
    let payload: { bookingId: string };

    try {
      payload = JSON.parse(msg.content.toString());
      if (!payload.bookingId) throw new Error("Payload thiếu bookingId.");
    } catch (error) {
      logger.error("Payload RabbitMQ Booking không hợp lệ.", error);
      channel.nack(msg, false, false);
      return;
    }

    const { bookingId } = payload;

    try {
      logger.info(
        `[Booking Worker] Đang xử lý đơn đặt phòng: ${bookingId} (Retry ${retries}/${MAX_RETRY})`,
      );

      await prisma.$transaction(async (tx) => {

        const bookings = await tx.$queryRaw<any[]>`
          SELECT id, "roomTypeId", status, quantity, check_in_date AS "checkInDate", check_out_date AS "checkOutDate", special_requests AS "specialRequests"
          FROM bookings 
          WHERE id = ${bookingId}::uuid 
          FOR UPDATE
        `;
        if (bookings.length === 0) return;
        const booking = bookings[0];

        if (booking.status !== BookingStatus.PENDING) return;

        const roomTypes = await tx.$queryRaw<any[]>`
          SELECT 1 FROM room_types WHERE id = ${booking.roomTypeId}::uuid FOR UPDATE
        `;
        if (roomTypes.length === 0) throw new Error("RoomType not found");

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
        } else {
          await tx.booking.update({
            where: { id: bookingId },
            data: { 
              status: BookingStatus.CANCELLED,
              specialRequests: (booking.specialRequests || "") + "\n[HỆ THỐNG]: Tự động hủy vì đã hết phòng trống." 
            }
          });
          logger.info(`[Booking Worker] Đơn ${bookingId} THẤT BẠI (Hết phòng).`);
        }
      });

      channel.ack(msg);
    } catch (error) {
      logger.error(`[Booking Worker] Lỗi xử lý đơn ${bookingId}`, error);

      if (retries >= MAX_RETRY) {
        logger.error(`Đơn ${bookingId} đã retry ${MAX_RETRY} lần. Rớt vào DLQ.`);
        channel.nack(msg, false, false);
        return;
      }

      logger.warn(`Retry lần ${retries + 1}/${MAX_RETRY} cho đơn ${bookingId}`);

      const content = Buffer.from(JSON.stringify(payload));
      channel.publish(
        EXCHANGES.BOOKING,
        ROUTING_KEYS.BOOKING_CREATE,
        content,
        {
          headers: { "x-retries": retries + 1 },
          persistent: true,
        },
      );

      channel.ack(msg);
    }
  }, 1);
};
