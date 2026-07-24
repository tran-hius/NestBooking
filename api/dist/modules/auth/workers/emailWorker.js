import { EmailService } from "@/modules/auth/services/emailService";
import { Transporter } from "@/config/transporter";
import logger from "@/config/logger";
import { rabbitmq } from "@/infrastructure/rabbitmq/rabbitMQ"; // <-- Dùng instance mới
import { QUEUES } from "@/infrastructure/rabbitmq/queues";
import { EXCHANGES } from "@/infrastructure/rabbitmq/exchanges";
import { ROUTING_KEYS } from "@/infrastructure/rabbitmq/routing.key";
const transporter = Transporter.transporter;
const emailService = new EmailService(transporter);
const MAX_RETRY = 3;
export const startEmailWorker = async () => {
    logger.info(`Email Worker đang lắng nghe Queue: ${QUEUES.EMAIL_OTP}`);
    // THAY ĐỔI: Thêm tham số channel vào callback để tương tác với RabbitMQ
    await rabbitmq.consumeQueue(QUEUES.EMAIL_OTP, async (msg, channel) => {
        if (!msg) {
            logger.warn("Nhận được message rỗng.");
            return;
        }
        const retries = Number(msg.properties.headers?.["x-retries"] ?? 0);
        let payload;
        try {
            payload = JSON.parse(msg.content.toString());
            if (!payload.to || !payload.otpCode) {
                throw new Error("Payload không hợp lệ.");
            }
        }
        catch (error) {
            logger.error("Payload RabbitMQ không hợp lệ.", error);
            // THAY ĐỔI: Nack với requeue = false -> Tự động rớt vào Dead Letter Queue
            channel.nack(msg, false, false);
            return;
        }
        try {
            logger.info(`Đang gửi OTP tới ${payload.to} (Retry ${retries}/${MAX_RETRY})`);
            await emailService.sendOtpEmail(payload.to, payload.otpCode);
            // Báo thành công
            channel.ack(msg);
            logger.info(`Đã gửi OTP thành công tới ${payload.to}`);
        }
        catch (error) {
            logger.error(`Lỗi gửi OTP tới ${payload.to}`, error);
            if (retries >= MAX_RETRY) {
                logger.error(`OTP tới ${payload.to} đã retry ${MAX_RETRY} lần. Đẩy message vào DLQ.`);
                // Hết lượt thử -> Chuyển vào DLQ
                channel.nack(msg, false, false);
                return;
            }
            logger.warn(`Retry lần ${retries + 1}/${MAX_RETRY} cho ${payload.to}`);
            const content = Buffer.from(JSON.stringify(payload));
            channel.publish(EXCHANGES.NOTIFICATION_DIRECT, ROUTING_KEYS.OTP_SEND, content, {
                headers: { "x-retries": retries + 1 },
                persistent: true,
            });
            channel.ack(msg);
        }
    });
};
export const startBookingNotificationWorker = async () => {
    logger.info(`Booking Notification Worker đang lắng nghe Queue: ${QUEUES.EMAIL_BOOKING}`);
    await rabbitmq.consumeQueue(QUEUES.EMAIL_BOOKING, async (msg, channel) => {
        if (!msg) {
            logger.warn("Nhận được message rỗng từ Email Booking Queue.");
            return;
        }
        const retries = Number(msg.properties.headers?.["x-retries"] ?? 0);
        let payload;
        try {
            payload = JSON.parse(msg.content.toString());
            if (!payload.type || !payload.to || !payload.bookingCode) {
                throw new Error("Payload Email Booking không hợp lệ.");
            }
        }
        catch (error) {
            logger.error("Lỗi parse Payload RabbitMQ Email Booking.", error);
            channel.nack(msg, false, false);
            return;
        }
        try {
            logger.info(`Đang gửi thông báo Đặt phòng (${payload.type}) tới ${payload.to} (Retry ${retries}/${MAX_RETRY})`);
            if (payload.type === "SUCCESS" && payload.to && payload.bookingCode && payload.checkInDate && payload.checkOutDate) {
                await emailService.sendBookingSuccessEmail(payload.to, payload.bookingCode, payload.checkInDate, payload.checkOutDate);
            }
            else if (payload.type === "FAIL" && payload.to && payload.bookingCode && payload.reason) {
                await emailService.sendBookingFailEmail(payload.to, payload.bookingCode, payload.reason);
            }
            channel.ack(msg);
            logger.info(`Đã gửi thông báo Đặt phòng thành công tới ${payload.to}`);
        }
        catch (error) {
            logger.error(`Lỗi gửi thông báo Đặt phòng tới ${payload.to}`, error);
            if (retries >= MAX_RETRY) {
                logger.error(`Email Booking tới ${payload.to} đã retry ${MAX_RETRY} lần. Rớt.`);
                channel.nack(msg, false, false);
                return;
            }
            logger.warn(`Retry lần ${retries + 1}/${MAX_RETRY} cho Email Booking ${payload.to}`);
            const content = Buffer.from(JSON.stringify(payload));
            const routingKey = payload.type === "SUCCESS" ? ROUTING_KEYS.EMAIL_BOOKING_SUCCESS : ROUTING_KEYS.EMAIL_BOOKING_FAIL;
            channel.publish(EXCHANGES.NOTIFICATION_DIRECT, routingKey, content, {
                headers: { "x-retries": retries + 1 },
                persistent: true,
            });
            channel.ack(msg);
        }
    });
};
