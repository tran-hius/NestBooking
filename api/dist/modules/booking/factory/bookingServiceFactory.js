import { prisma } from "../../../config/prisma.js";
import { Transporter } from "../../../config/transporter.js";
import { BookingReadRepository } from "../repositories/bookingReadRepository.js";
import { BookingWriteRepository } from "../repositories/bookingWriteRepository.js";
import { HotelService } from "../../hotel/services/hotelService.js";
import { RoomTypeService } from "../../hotel/services/roomTypeService.js";
import { RoomService } from "../../hotel/services/roomService.js";
import { RoomTypeRepository } from "../../hotel/repositories/roomTypeRepository.js";
import { RoomRepository } from "../../hotel/repositories/roomRepository.js";
import { HotelRepository } from "../../hotel/repositories/hotelRepository.js";
import { BookingService } from "../services/bookingService.js";
import { BookingAvailabilityService } from "../services/bookingCreation/bookingAvailability.js";
import { BookingPayment } from "../services/bookingCreation/bookingPayment.js";
import { BookingPostProcess } from "../services/bookingCreation/bookingPostProcess.js";
import { BookingCreationService } from "../services/bookingCreation/bookingCreationService.js";
import { BookingLockService } from "../services/bookingCreation/bookingLockService.js";
import { VnpayService } from "../../payment/services/vnpayService.js";
import { EmailService } from "../../email/services/emailService.js";
import { UploadService } from "../../upload/services/uploadService.js";
export class BookingServiceFactory {
    static createBookingAvailabilityService() {
        const readRepo = new BookingReadRepository(prisma);
        const hotelRepo = new HotelRepository(prisma);
        const roomTypeRepo = new RoomTypeRepository(prisma);
        const roomRepo = new RoomRepository(prisma);
        const uploadService = new UploadService();
        const roomTypeService = new RoomTypeService(roomTypeRepo, hotelRepo, uploadService);
        const roomService = new RoomService(roomRepo, roomTypeRepo, hotelRepo);
        return new BookingAvailabilityService(roomTypeService, roomService, readRepo);
    }
    static create() {
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
        const bookingCreationService = new BookingCreationService(bookingAvailability, writeRepo, bookingPayment, bookingPostProcess, bookingLockService);
        return new BookingService(readRepo, writeRepo, hotelService, bookingCreationService);
    }
}
