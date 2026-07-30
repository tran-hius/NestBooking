import { SortByOption, } from "../dtos/searchDTO";
import { HotelStatus, BookingStatus } from "@/../generated/prisma";
import { BadRequestError } from "@/utils/errors/errorCustomize";
import { SearchMapper } from "../mapper/searchMapper";
export class SearchService {
    searchRepository;
    bookingAvailabilityService;
    constructor(searchRepository, bookingAvailabilityService) {
        this.searchRepository = searchRepository;
        this.bookingAvailabilityService = bookingAvailabilityService;
    }
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
        if (propertyType)
            hotelWhere.propertyType = propertyType;
        if (amenities) {
            const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
            if (amenitiesArray.length > 0) {
                hotelWhere.amenities = { hasSome: amenitiesArray };
            }
        }
        const bookingOverlapCondition = checkInDate && checkOutDate
            ? {
                status: { notIn: [BookingStatus.CANCELLED] },
                checkInDate: { lt: new Date(checkOutDate) },
                checkOutDate: { gt: new Date(checkInDate) },
            }
            : false;
        const hotels = await this.searchRepository.findHotelsForSearch(hotelWhere, bookingOverlapCondition);
        let filteredHotels = [];
        for (const hotel of hotels) {
            const availableRoomTypes = [];
            for (const roomType of hotel.roomTypes) {
                if (roomType.maxAdults * rooms < adults || roomType.maxChildren * rooms < children)
                    continue;
                const price = Number(roomType.price);
                if (minPrice && price < minPrice)
                    continue;
                if (maxPrice && price > maxPrice)
                    continue;
                const availableQuantity = this.bookingAvailabilityService.calculateAvailableRooms(roomType.rooms.length, roomType.bookings || [], checkInDate ? new Date(checkInDate) : undefined, checkOutDate ? new Date(checkOutDate) : undefined);
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
            if (availableRoomTypes.length > 0) {
                const startingPrice = Math.min(...availableRoomTypes.map((rt) => rt.price));
                filteredHotels.push(SearchMapper.toSearchResponseDto(hotel, availableRoomTypes, startingPrice));
            }
        }
        if (sortBy === SortByOption.PRICE_ASC)
            filteredHotels.sort((a, b) => a.startingPrice - b.startingPrice);
        else if (sortBy === SortByOption.PRICE_DESC)
            filteredHotels.sort((a, b) => b.startingPrice - a.startingPrice);
        else if (sortBy === SortByOption.RATING_DESC)
            filteredHotels.sort((a, b) => b.rating - a.rating);
        const total = filteredHotels.length;
        const startIndex = (page - 1) * limit;
        const paginatedHotels = filteredHotels.slice(startIndex, startIndex + limit);
        return {
            data: paginatedHotels,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
