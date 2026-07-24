import { prisma } from "@/config/prisma";
import { SortByOption } from "../dtos/SearchDto";
import { HotelStatus, BookingStatus } from "@/../generated/prisma";
import { BadRequestError } from "@/utils/errors";
export class SearchService {
    async searchHotels(dto) {
        const { location, checkInDate, checkOutDate, adults = 1, children = 0, rooms = 1, minPrice, maxPrice, propertyType, amenities, sortBy, page = 1, limit = 10, } = dto;
        if (checkInDate && checkOutDate) {
            if (new Date(checkInDate) >= new Date(checkOutDate)) {
                throw new BadRequestError("Ngày nhận phòng phải trước ngày trả phòng.");
            }
            if (new Date(checkInDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
                throw new BadRequestError("Ngày nhận phòng không được trong quá khứ.");
            }
        }
        // 1. Xây dựng điều kiện lọc cơ bản cho Hotel
        const hotelWhere = {
            status: HotelStatus.ACTIVE,
            deletedAt: null,
        };
        if (location) {
            hotelWhere.OR = [
                { city: { contains: location, mode: "insensitive" } },
                { address: { contains: location, mode: "insensitive" } },
                { name: { contains: location, mode: "insensitive" } },
            ];
        }
        if (propertyType) {
            hotelWhere.propertyType = propertyType;
        }
        if (amenities && amenities.length > 0) {
            // Postgres array contains
            hotelWhere.amenities = {
                hasSome: amenities,
            };
        }
        // Xây dựng điều kiện overlap Booking nếu có ngày
        const bookingOverlapCondition = (checkInDate && checkOutDate) ? {
            status: { notIn: [BookingStatus.CANCELLED] },
            checkInDate: { lt: new Date(checkOutDate) },
            checkOutDate: { gt: new Date(checkInDate) },
        } : { id: "never_match" }; // Nếu không có ngày, không cần fetch bookings
        // Lấy toàn bộ hotels thoả điều kiện kèm RoomTypes
        const hotels = await prisma.hotel.findMany({
            where: hotelWhere,
            include: {
                images: { select: { imageUrl: true } },
                roomTypes: {
                    where: { isActive: true },
                    include: {
                        rooms: {
                            where: { isActive: true, status: "AVAILABLE" },
                        },
                        bookings: checkInDate && checkOutDate ? {
                            where: bookingOverlapCondition,
                        } : false, // Bỏ qua nếu không search theo ngày
                    },
                },
            },
        });
        // 2. Lọc bằng JavaScript/TypeScript để kiểm tra Available Rooms & Giá
        let filteredHotels = [];
        for (const hotel of hotels) {
            const availableRoomTypes = [];
            for (const roomType of hotel.roomTypes) {
                // Kiểm tra sức chứa (Capacity)
                if (roomType.maxAdults < adults || roomType.maxChildren < children) {
                    continue;
                }
                // Kiểm tra giá (Price)
                const price = Number(roomType.price);
                if (minPrice && price < minPrice)
                    continue;
                if (maxPrice && price > maxPrice)
                    continue;
                // Tính toán phòng trống (Availability)
                let availableQuantity = roomType.rooms.length;
                if (checkInDate && checkOutDate) {
                    const bookedQuantity = roomType.bookings.reduce((sum, b) => sum + b.quantity, 0);
                    availableQuantity = availableQuantity - bookedQuantity;
                }
                // Nếu đáp ứng đủ số lượng phòng yêu cầu
                if (availableQuantity >= rooms) {
                    availableRoomTypes.push({
                        id: roomType.id,
                        name: roomType.name,
                        price: price,
                        maxAdults: roomType.maxAdults,
                        maxChildren: roomType.maxChildren,
                        availableRooms: availableQuantity,
                        thumbnail: roomType.thumbnail,
                    });
                }
            }
            // Khách sạn chỉ được hiển thị nếu có ít nhất 1 loại phòng thoả mãn
            if (availableRoomTypes.length > 0) {
                // Tìm giá thấp nhất để hiển thị đại diện cho Hotel
                const startingPrice = Math.min(...availableRoomTypes.map((rt) => rt.price));
                filteredHotels.push({
                    id: hotel.id,
                    name: hotel.name,
                    slug: hotel.slug,
                    address: hotel.address,
                    city: hotel.city,
                    thumbnail: hotel.thumbnail,
                    rating: hotel.rating,
                    propertyType: hotel.propertyType,
                    amenities: hotel.amenities,
                    images: hotel.images.map((img) => img.imageUrl),
                    startingPrice,
                    availableRoomTypes,
                });
            }
        }
        // 3. Sắp xếp (Sorting)
        if (sortBy === SortByOption.PRICE_ASC) {
            filteredHotels.sort((a, b) => a.startingPrice - b.startingPrice);
        }
        else if (sortBy === SortByOption.PRICE_DESC) {
            filteredHotels.sort((a, b) => b.startingPrice - a.startingPrice);
        }
        else if (sortBy === SortByOption.RATING_DESC) {
            filteredHotels.sort((a, b) => b.rating - a.rating);
        }
        // 4. Phân trang (Pagination)
        const total = filteredHotels.length;
        const startIndex = (page - 1) * limit;
        const paginatedHotels = filteredHotels.slice(startIndex, startIndex + limit);
        return {
            data: paginatedHotels,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
