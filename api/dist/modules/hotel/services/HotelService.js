import { HotelStatus } from "#generated/prisma";
import { HotelMapper } from "../mapper/HotelMapper.js";
import { ForbiddenError, NotFoundError, } from "../../../utils/errors/errorCustomize.js";
import logger from "../../../config/logger.js";
import { REDIS_KEYS, redisClient, REDIS_TTL } from "../../../infrastructure/redis/index.js";
import { deleteFromCloudinary } from "../../../utils/cloudinary.utils.js";
import crypto from "crypto";
export class HotelService {
    hotelRepository;
    constructor(hotelRepository) {
        this.hotelRepository = hotelRepository;
    }
    async clearHotelCache(hotelId) {
        const keysToDelete = [REDIS_KEYS.HOTEL(hotelId)];
        if (keysToDelete.length > 0) {
            await redisClient.del(...keysToDelete);
        }
    }
    generateSlug(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
    async createHotel(ownerId, data) {
        let slug = this.generateSlug(data.name);
        let isExist = await this.hotelRepository.existsBySlug(slug);
        if (isExist) {
            slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        const hotel = await this.hotelRepository.create({
            ...data,
            ownerId,
            slug,
            status: HotelStatus.PENDING,
        });
        return HotelMapper.toResponseDto(hotel);
    }
    async getHotelsByAgent(ownerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [hotels, total] = await Promise.all([
            this.hotelRepository.findMany({
                where: { ownerId, deletedAt: null },
                orderBy: { createdAt: "desc" },
                skip: skip,
                take: limit,
                include: { images: true, roomTypes: true },
            }),
            this.hotelRepository.count({
                where: { ownerId, deletedAt: null },
            }),
        ]);
        return {
            data: HotelMapper.toResponseDtoList(hotels),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getHotelById(id, ownerId) {
        const cacheKey = REDIS_KEYS.HOTEL(id);
        const cachedHotel = await redisClient.get(cacheKey);
        if (cachedHotel) {
            logger.debug(`[Cache Hit] Lấy thông tin hotel ID: ${id} từ Redis`);
            const hotelDto = JSON.parse(cachedHotel);
            if (ownerId && hotelDto.ownerId !== ownerId) {
                throw new ForbiddenError("Bạn không có quyền xem thông tin nội bộ của khách sạn này.");
            }
            return hotelDto;
        }
        logger.debug(`[Cache Miss] Tìm hotel ID: ${id} trong Database`);
        const hotel = await this.hotelRepository.findById(id);
        if (!hotel || hotel.deletedAt) {
            throw new NotFoundError("Không tìm thấy khách sạn hoặc khách sạn đã bị xóa.");
        }
        if (ownerId && hotel.ownerId !== ownerId) {
            throw new ForbiddenError("Bạn không có quyền xem thông tin nội bộ của khách sạn này.");
        }
        const responseDto = HotelMapper.toResponseDto(hotel);
        await redisClient.setex(cacheKey, 3600, JSON.stringify(responseDto));
        return responseDto;
    }
    async updateHotel(id, ownerId, data) {
        const hotel = await this.hotelRepository.findById(id);
        if (!hotel || hotel.deletedAt) {
            throw new NotFoundError("Không tìm thấy khách sạn này.");
        }
        if (hotel.ownerId !== ownerId) {
            throw new ForbiddenError("Bạn không có quyền chỉnh sửa khách sạn này.");
        }
        let newSlug = hotel.slug;
        if (data.name && data.name !== hotel.name) {
            newSlug = this.generateSlug(data.name);
            const isExist = await this.hotelRepository.existsBySlug(newSlug);
            if (isExist) {
                newSlug = `${newSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
            }
        }
        const updatedHotel = await this.hotelRepository.update(id, {
            ...data,
            slug: newSlug,
        });
        await this.clearHotelCache(id);
        return HotelMapper.toResponseDto(updatedHotel);
    }
    async softDeleteHotel(id, ownerId) {
        logger.warn(`Thực hiện xóa mềm hotel ID: ${id}`);
        const hotel = await this.hotelRepository.findById(id);
        if (!hotel || hotel.deletedAt) {
            throw new NotFoundError("Không tìm thấy khách sạn.");
        }
        if (hotel.ownerId !== ownerId) {
            throw new ForbiddenError("Bạn không có quyền xóa khách sạn này.");
        }
        await this.hotelRepository.delete(id);
        await this.clearHotelCache(id);
        logger.info(`Đã ẩn hoàn toàn hotel ID ${id} ra khỏi hệ thống.`);
    }
    async restoreHotel(id, ownerId) {
        const hotel = await this.hotelRepository.findById(id);
        if (!hotel || hotel.ownerId !== ownerId) {
            throw new NotFoundError("Khách sạn không tồn tại hoặc bạn không có quyền.");
        }
        await this.hotelRepository.restore(id, ownerId);
        await this.clearHotelCache(id);
        const restoredHotel = await this.hotelRepository.findById(id);
        if (!restoredHotel) {
            throw new NotFoundError("Lỗi sau khi khôi phục khách sạn.");
        }
        return HotelMapper.toResponseDto(restoredHotel);
    }
    async getAllHotels(query, page = 1, limit = 10) {
        const queryHash = crypto
            .createHash("md5")
            .update(JSON.stringify({ query, page, limit }))
            .digest("hex");
        const cacheKey = REDIS_KEYS.HOTEL_LIST_QUERY(queryHash);
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const skip = (page - 1) * limit;
        const [hotels, total] = await Promise.all([
            this.hotelRepository.findMany({
                where: { ...query, deletedAt: null },
                orderBy: { createdAt: "desc" },
                skip: skip,
                take: limit,
                include: { images: true, roomTypes: true },
            }),
            this.hotelRepository.count({
                where: { ...query, deletedAt: null },
            }),
        ]);
        const response = {
            data: HotelMapper.toResponseDtoList(hotels),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
        await redisClient.setex(cacheKey, REDIS_TTL.HOTEL, JSON.stringify(response));
        return response;
    }
    async addHotelImages(ownerId, hotelId, data) {
        const hotel = await this.hotelRepository.findById(hotelId);
        if (!hotel || hotel.deletedAt) {
            throw new NotFoundError("Khách sạn không tồn tại hoặc đã bị xóa.");
        }
        if (hotel.ownerId !== ownerId) {
            throw new ForbiddenError("Bạn không có quyền quản lý khách sạn này.");
        }
        const imageInput = data.imageUrls.map((url) => ({
            hotelId,
            imageUrl: url,
        }));
        await this.hotelRepository.addImages(imageInput);
        await this.clearHotelCache(hotelId);
    }
    async deleteHotelImage(ownerId, imageId) {
        const image = await this.hotelRepository.findImageById(imageId);
        if (!image)
            throw new NotFoundError("Không tìm thấy ảnh.");
        const hotel = await this.hotelRepository.findById(image.hotelId);
        if (!hotel || hotel.deletedAt) {
            throw new NotFoundError("Khách sạn không tồn tại hoặc đã bị xóa.");
        }
        if (hotel.ownerId !== ownerId) {
            throw new ForbiddenError("Bạn không có quyền quản lý khách sạn này.");
        }
        // Try to delete from Cloudinary
        try {
            const match = image.imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/i);
            if (match && match[1]) {
                await deleteFromCloudinary(match[1]);
            }
            else {
                logger.warn(`[Cloudinary] Không thể parse public_id từ URL: ${image.imageUrl}`);
            }
        }
        catch (error) {
            logger.error(`[Cloudinary] Lỗi khi xóa ảnh hotel: ${error}`);
        }
        await this.hotelRepository.deleteImage(imageId);
        await this.clearHotelCache(hotel.id);
    }
}
