import cron from "node-cron";
import logger from "@/config/logger";
import { prisma } from "@/config/prisma";
import { BookingStatus } from "#generated/prisma";
export class SchedulerService {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    init() {
        logger.info("[SchedulerService] Khởi tạo các cron job...");
        this.scheduleExpiredBookingsCleanup();
    }
    scheduleExpiredBookingsCleanup() {
        // Chạy mỗi 5 phút một lần để hủy các booking PENDING đã quá hạn
        cron.schedule("*/5 * * * *", async () => {
            logger.info("[SchedulerService] Đang kiểm tra các booking hết hạn thanh toán...");
            try {
                const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
                const expiredBookings = await this.db.booking.updateMany({
                    where: {
                        status: BookingStatus.PENDING,
                        createdAt: {
                            lt: fifteenMinutesAgo,
                        },
                    },
                    data: {
                        status: BookingStatus.CANCELLED,
                    },
                });
                if (expiredBookings.count > 0) {
                    logger.info(`[SchedulerService] Đã hủy ${expiredBookings.count} booking do hết hạn thanh toán.`);
                }
            }
            catch (error) {
                logger.error("[SchedulerService] Lỗi khi dọn dẹp expired bookings:", error);
            }
        });
    }
}
