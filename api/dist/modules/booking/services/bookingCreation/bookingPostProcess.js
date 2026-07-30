import { BookingStatus } from "#generated/prisma";
import { BookingCacheHelper } from "../../utils/bookingCacheHelper";
import logger from "@/config/logger";
export class BookingPostProcess {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    async execute(booking) {
        await BookingCacheHelper.clearBookingCache(booking.id, booking.userId, booking.hotelId);
        if (booking.status !== BookingStatus.CONFIRMED) {
            return;
        }
        try {
            await this.emailService.sendBookingSuccessEmail(booking.guestEmail, booking.bookingCode, booking.checkInDate.toISOString(), booking.checkOutDate.toISOString());
        }
        catch (error) {
            logger.error(`Send booking email failed for booking ${booking.id}: ${error}`);
        }
    }
}
