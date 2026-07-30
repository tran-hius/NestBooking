import { BadRequestError, NotFoundError } from "@/utils/errors";
export class BookingAvailabilityService {
    roomTypeService;
    roomService;
    bookingReadRepo;
    constructor(roomTypeService, roomService, bookingReadRepo) {
        this.roomTypeService = roomTypeService;
        this.roomService = roomService;
        this.bookingReadRepo = bookingReadRepo;
    }
    async validateAvailability(roomTypeId, quantity, checkIn, checkOut, tx) {
        const roomType = await this.roomTypeService.getRoomTypeById(roomTypeId, tx);
        if (!roomType || !roomType.isActive) {
            throw new NotFoundError("Không tìm thấy loại phòng này hoặc phòng đang bị tạm khóa.");
        }
        const totalRooms = await this.roomService.countActiveRoomsByRoomType(roomTypeId, tx);
        const bookedRooms = await this.bookingReadRepo.getOverlappingBookingsCount(roomTypeId, checkIn, checkOut, tx);
        const availableRooms = totalRooms - bookedRooms;
        if (availableRooms < quantity) {
            throw new BadRequestError(`Rất tiếc! Chỉ còn lại ${availableRooms} phòng trống trong khoảng thời gian bạn chọn.`);
        }
        return roomType;
    }
    calculateAvailableRooms(totalRooms, overlappingBookings, checkInDate, checkOutDate) {
        let availableQuantity = totalRooms;
        if (checkInDate && checkOutDate) {
            const bookings = overlappingBookings || [];
            const bookedQuantity = bookings.reduce((sum, b) => sum + b.quantity, 0);
            availableQuantity = availableQuantity - bookedQuantity;
        }
        return availableQuantity;
    }
}
