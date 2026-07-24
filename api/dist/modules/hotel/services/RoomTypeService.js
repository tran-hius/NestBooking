import { RoomTypeMapper } from "../mapper/RoomTypeMapper";
import { ForbiddenError, NotFoundError, BadRequestError, } from "@/utils/errors/errorCustomize";
import { redisClient } from "@/infrastructure/redis/RedisConnection";
import { REDIS_KEYS } from "@/infrastructure/redis/redisKeys";
import { REDIS_TTL } from "@/infrastructure/redis/redisTTL";
import { deleteFromCloudinary } from "@/utils/cloudinary.utils";
import logger from "@/config/logger";
export class RoomTypeService {
    roomTypeRepo;
    hotelRepo;
    constructor(roomTypeRepo, hotelRepo) {
        this.roomTypeRepo = roomTypeRepo;
        this.hotelRepo = hotelRepo;
    }
    // --- Helper Cache Invalidation ---
    async invalidateCache(hotelId, roomTypeId) {
        const pipeline = redisClient.pipeline();
        pipeline.del(REDIS_KEYS.ROOM_TYPES_BY_HOTEL(hotelId));
        pipeline.del(REDIS_KEYS.PUBLIC_ROOM_TYPES_BY_HOTEL(hotelId));
        if (roomTypeId) {
            pipeline.del(REDIS_KEYS.ROOM_TYPE(roomTypeId));
        }
        await pipeline.exec();
    }
    async verifyHotelOwnership(hotelId, ownerId) {
        const hotel = await this.hotelRepo.findById(hotelId);
        if (!hotel || hotel.deletedAt) {
            throw new NotFoundError("Khách sạn không tồn tại hoặc đã bị xóa.");
        }
        if (hotel.ownerId !== ownerId) {
            throw new ForbiddenError("Bạn không có quyền quản lý khách sạn này.");
        }
    }
    async verifyRoomTypeOwnership(roomTypeId, ownerId) {
        const roomType = await this.roomTypeRepo.findById(roomTypeId);
        if (!roomType) {
            throw new NotFoundError("Không tìm thấy loại phòng.");
        }
        await this.verifyHotelOwnership(roomType.hotelId, ownerId);
        return roomType;
    }
    async createRoomType(ownerId, hotelId, data) {
        await this.verifyHotelOwnership(hotelId, ownerId);
        const exists = await this.roomTypeRepo.existsByName(hotelId, data.name);
        if (exists) {
            throw new BadRequestError("Tên loại phòng đã tồn tại trong khách sạn này.");
        }
        const { thumbnail, ...restData } = data;
        const newRoomType = await this.roomTypeRepo.create({
            ...restData,
            thumbnail: thumbnail || null,
            hotelId,
        });
        await this.invalidateCache(hotelId);
        return RoomTypeMapper.toResponseDto(newRoomType);
    }
    async updateRoomType(ownerId, id, data) {
        const roomType = await this.verifyRoomTypeOwnership(id, ownerId);
        if (data.name && data.name !== roomType.name) {
            const exists = await this.roomTypeRepo.existsByName(roomType.hotelId, data.name);
            if (exists) {
                throw new BadRequestError("Tên loại phòng đã tồn tại trong khách sạn này.");
            }
        }
        const updatedRoomType = await this.roomTypeRepo.update(id, {
            ...data,
            thumbnail: data.thumbnail === undefined ? roomType.thumbnail : data.thumbnail,
        });
        await this.invalidateCache(roomType.hotelId, id);
        return RoomTypeMapper.toResponseDto(updatedRoomType);
    }
    async deleteRoomType(ownerId, id) {
        const roomType = await this.verifyRoomTypeOwnership(id, ownerId);
        await this.roomTypeRepo.delete(id);
        await this.invalidateCache(roomType.hotelId, id);
    }
    async getRoomTypeById(id) {
        const cacheKey = REDIS_KEYS.ROOM_TYPE(id);
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData)
            return JSON.parse(cachedData);
        const roomType = await this.roomTypeRepo.findById(id);
        if (!roomType)
            throw new NotFoundError("Không tìm thấy loại phòng.");
        const response = RoomTypeMapper.toResponseDto(roomType);
        await redisClient.setex(cacheKey, REDIS_TTL.ROOM_TYPE, JSON.stringify(response));
        return response;
    }
    async getRoomTypesByHotel(hotelId) {
        const cacheKey = REDIS_KEYS.ROOM_TYPES_BY_HOTEL(hotelId);
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData)
            return JSON.parse(cachedData);
        const roomTypes = await this.roomTypeRepo.findByHotelId(hotelId);
        const response = RoomTypeMapper.toResponseDtoList(roomTypes);
        await redisClient.setex(cacheKey, REDIS_TTL.ROOM_TYPE, JSON.stringify(response));
        return response;
    }
    async getPublicRoomTypesByHotel(hotelId) {
        const cacheKey = REDIS_KEYS.PUBLIC_ROOM_TYPES_BY_HOTEL(hotelId);
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData)
            return JSON.parse(cachedData);
        const hotel = await this.hotelRepo.findById(hotelId);
        if (!hotel || hotel.deletedAt)
            throw new NotFoundError("Khách sạn không tồn tại.");
        const roomTypes = await this.roomTypeRepo.findPublicByHotelId(hotelId);
        const response = RoomTypeMapper.toResponseDtoList(roomTypes);
        await redisClient.setex(cacheKey, REDIS_TTL.ROOM_TYPE, JSON.stringify(response));
        return response;
    }
    async addRoomTypeImages(ownerId, roomTypeId, data) {
        const roomType = await this.verifyRoomTypeOwnership(roomTypeId, ownerId);
        const imageInput = data.imageUrls.map((url) => ({
            roomTypeId,
            imageUrl: url,
        }));
        await this.roomTypeRepo.addImages(imageInput);
        await this.invalidateCache(roomType.hotelId, roomTypeId);
    }
    async deleteRoomTypeImage(ownerId, imageId) {
        const image = await this.roomTypeRepo.findImageById(imageId);
        if (!image)
            throw new NotFoundError("Không tìm thấy ảnh.");
        const roomType = await this.verifyRoomTypeOwnership(image.roomTypeId, ownerId);
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
            logger.error(`[Cloudinary] Lỗi khi xóa ảnh room-type: ${error}`);
        }
        await this.roomTypeRepo.deleteImage(imageId);
        await this.invalidateCache(roomType.hotelId, image.roomTypeId);
    }
}
