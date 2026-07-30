import { PaymentMethod, PaymentStatus } from "#generated/prisma";
import { BookingResponseDto, CreateBookingDto } from "../../dtos/bookingDTO";
import { BookingMapper } from "../../mapper/bookingMapper";
import { BookingWriteRepository } from "../../repositories/bookingWriteRepository";
import { BookingAvailabilityService } from "./bookingAvailability";
import { BookingPayment } from "./bookingPayment";
import { BookingPostProcess } from "./bookingPostProcess";
import crypto from "crypto";
import { BookingLockService } from "./bookingLockService";
import { prisma } from "@/config/prisma";
import { BadRequestError } from "@/utils/errors";
import logger from "@/config/logger";
import { IBookingCreationService } from "../../interfaces/iBookingCreationService";

export class BookingCreationService implements IBookingCreationService {
  constructor(
    private readonly availabilityService: BookingAvailabilityService,
    private readonly bookingWriteRepo: BookingWriteRepository,
    private readonly bookingPayment: BookingPayment,
    private readonly bookingPostProcess: BookingPostProcess,
    private readonly bookingLockService: BookingLockService
  ) {}

  async createBooking(userId: string, data: CreateBookingDto, ipAddr: string = "127.0.0.1"): Promise<BookingResponseDto>{
    const { checkIn, checkOut, nights } = this.validateAndParseDates(data.checkInDate, data.checkOutDate);
    
    // Acquire Distributed Lock
    const lockValue = await this.bookingLockService.acquireLockWithRetry(data.roomTypeId);
    if (!lockValue) {
      throw new BadRequestError("Hệ thống đang quá tải cho loại phòng này, vui lòng thử lại sau giây lát.");
    }

    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
        return this.executeBookingTransaction(userId, data, checkIn, checkOut, nights, tx);
      });
    } finally {
      await this.bookingLockService.releaseLock(data.roomTypeId, lockValue);
    }

    const paymentUrl = this.generatePaymentUrlSafe(booking, ipAddr);
    await this.bookingPostProcess.execute(booking);

    const response = BookingMapper.toResponseDto(booking);
    if (paymentUrl) {
      response.paymentUrl = paymentUrl;
    }

    return response;
  }

  private validateAndParseDates(checkInStr: string, checkOutStr: string) {
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if(checkIn < today){
      throw new BadRequestError("Ngày Check-in không được nằm trong quá khứ.");
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return { checkIn, checkOut, nights };
  }

  private async executeBookingTransaction(userId: string, data: CreateBookingDto, checkIn: Date, checkOut: Date, nights: number, tx: any) {
    const roomType = await this.availabilityService.validateAvailability(data.roomTypeId, data.quantity, checkIn, checkOut, tx);

    const bookingCode = `BKG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const totalAmount = Number(roomType.price) * nights * data.quantity;
    
    if (totalAmount <= 0) {
      throw new BadRequestError("Tổng tiền đặt phòng không hợp lệ.");
    }

    const paymentDetails = this.bookingPayment.determineStatus(data.paymentMethod);

    return this.bookingWriteRepo.create({
      bookingCode,
      userId,
      hotelId: data.hotelId,
      roomTypeId: data.roomTypeId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      quantity: data.quantity,
      totalAmount,
      status: paymentDetails.bookingStatus,
      paymentMethod: paymentDetails.paymentMethod,
      paymentStatus: paymentDetails.paymentStatus,
      paymentDate: null,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail,
      specialRequests: data.specialRequests,
    }, tx);
  }

  private generatePaymentUrlSafe(booking: any, ipAddr: string): string | undefined {
    try {
      return this.bookingPayment.generatePaymentUrl(
        booking.paymentMethod,
        Number(booking.totalAmount),
        booking.bookingCode,
        booking.id,
        ipAddr
      );
    } catch (error) {
      logger.error(`Error generating payment URL for booking ${booking.id}: ${error}`);
      return undefined;
    }
  }
}
