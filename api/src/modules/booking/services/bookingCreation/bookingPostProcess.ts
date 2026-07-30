import { Booking, BookingStatus } from "#generated/prisma";
import { EmailService } from "@/modules/email/services/emailService";
import { BookingCacheHelper } from "../../utils/bookingCacheHelper";
import logger from "@/config/logger";

export class BookingPostProcess {
  constructor(private readonly emailService: EmailService) {}

  async execute(booking: Booking): Promise<void> {
    await BookingCacheHelper.clearBookingCache(booking.id, booking.userId, booking.hotelId);

    if (booking.status !== BookingStatus.CONFIRMED) {
      return;
    }

    try {
      await this.emailService.sendBookingSuccessEmail(
        booking.guestEmail,
        booking.bookingCode,
        booking.checkInDate.toISOString(),
        booking.checkOutDate.toISOString(),
      );
    } catch (error) {
      logger.error(`Send booking email failed for booking ${booking.id}: ${error}`);
    }
  }
}
