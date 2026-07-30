import { prisma } from "@/config/prisma";
import { Transporter } from "@/config/transporter";

import { BookingReadRepository } from "../repositories/bookingReadRepository";
import { BookingWriteRepository } from "../repositories/bookingWriteRepository";
import { HotelService } from "../../hotel/services/hotelService";
import { RoomTypeService } from "../../hotel/services/roomTypeService";
import { RoomService } from "../../hotel/services/roomService";
import { RoomTypeRepository } from "../../hotel/repositories/roomTypeRepository";
import { RoomRepository } from "../../hotel/repositories/roomRepository";
import { HotelRepository } from "../../hotel/repositories/hotelRepository";
import { BookingService } from "../services/bookingService";
import { BookingAvailabilityService } from "../services/bookingCreation/bookingAvailability";
import { BookingPayment } from "../services/bookingCreation/bookingPayment";
import { BookingPostProcess } from "../services/bookingCreation/bookingPostProcess";
import { BookingCreationService } from "../services/bookingCreation/bookingCreationService";
import { BookingLockService } from "../services/bookingCreation/bookingLockService";
import { VnpayService } from "../../payment/services/vnpayService";
import { EmailService } from "../../email/services/emailService";
import { UploadService } from "../../upload/services/uploadService";
import { IBookingService } from "../interfaces/iBookingService";

export class BookingServiceFactory {
  static createBookingAvailabilityService(): BookingAvailabilityService {
    const readRepo = new BookingReadRepository(prisma);
    const hotelRepo = new HotelRepository(prisma);
    const roomTypeRepo = new RoomTypeRepository(prisma);
    const roomRepo = new RoomRepository(prisma);
    const uploadService = new UploadService();
    const roomTypeService = new RoomTypeService(roomTypeRepo, hotelRepo, uploadService);
    const roomService = new RoomService(roomRepo, roomTypeRepo, hotelRepo);
    return new BookingAvailabilityService(roomTypeService, roomService, readRepo);
  }

  static create(): IBookingService {
    const readRepo = new BookingReadRepository(prisma);
    const writeRepo = new BookingWriteRepository(prisma);
    const hotelRepo = new HotelRepository(prisma);
    const roomTypeRepo = new RoomTypeRepository(prisma);
    const roomRepo = new RoomRepository(prisma);

    const uploadService = new UploadService();
    const hotelService = new HotelService(hotelRepo, uploadService);
    const roomTypeService = new RoomTypeService(roomTypeRepo, hotelRepo, uploadService);
    const roomService = new RoomService(roomRepo, roomTypeRepo, hotelRepo);

    const bookingAvailability = new BookingAvailabilityService(roomTypeService, roomService, readRepo);
    const vnpayService = new VnpayService();
    const bookingPayment = new BookingPayment(vnpayService);
    const emailService = new EmailService(Transporter.transporter);
    const bookingPostProcess = new BookingPostProcess(emailService);
    const bookingLockService = new BookingLockService();

    const bookingCreationService = new BookingCreationService(
      bookingAvailability,
      writeRepo,
      bookingPayment,
      bookingPostProcess,
      bookingLockService
    );

    return new BookingService(
      readRepo,
      writeRepo,
      hotelService,
      bookingCreationService
    );
  }
}
