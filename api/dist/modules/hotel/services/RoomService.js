import { RoomMapper } from "../mapper/RoomMapper";
import { ForbiddenError, NotFoundError, BadRequestError, } from "@/utils/errors/errorCustomize";
import { redisClient } from "@/infrastructure/redis/RedisConnection";
import { REDIS_KEYS } from "@/infrastructure/redis/redisKeys";
import { REDIS_TTL } from "@/infrastructure/redis/redisTTL";
export class RoomService {
    roomRepo;
    roomTypeRepo;
    hotelRepo;
    constructor(roomRepo, roomTypeRepo, hotelRepo) {
        this.roomRepo = roomRepo;
        this.roomTypeRepo = roomTypeRepo;
        this.hotelRepo = hotelRepo;
    }
    async invalidateCache(hotelId, roomTypeId, roomId) {
        const pipeline = redisClient.pipeline();
        pipeline.del(REDIS_KEYS.ROOMS_BY_HOTEL(hotelId));
        if (roomTypeId) {
            pipeline.del(REDIS_KEYS.ROOMS_BY_ROOM_TYPE(roomTypeId));
            pipeline.del(REDIS_KEYS.ROOM_TYPES_BY_HOTEL(hotelId));
            pipeline.del(REDIS_KEYS.PUBLIC_ROOM_TYPES_BY_HOTEL(hotelId));
            pipeline.del(REDIS_KEYS.ROOM_TYPE(roomTypeId));
        }
        if (roomId) {
            pipeline.del(REDIS_KEYS.ROOM(roomId));
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
    async verifyRoomOwnership(roomId, ownerId) {
        const room = await this.roomRepo.findById(roomId);
        if (!room) {
            throw new NotFoundError("Không tìm thấy phòng.");
        }
        await this.verifyHotelOwnership(room.hotelId, ownerId);
        return room;
    }
    async createRoom(ownerId, hotelId, data) {
        await this.verifyHotelOwnership(hotelId, ownerId);
        // Verify roomType belongs to this hotel
        const roomType = await this.roomTypeRepo.findById(data.roomTypeId);
        if (!roomType || roomType.hotelId !== hotelId) {
            throw new BadRequestError("Loại phòng không hợp lệ hoặc không thuộc khách sạn này.");
        }
        const exists = await this.roomRepo.existsByNumber(hotelId, data.roomNumber);
        if (exists) {
            throw new BadRequestError(`Số phòng ${data.roomNumber} đã tồn tại trong khách sạn này.`);
        }
        const newRoom = await this.roomRepo.create({
            ...data,
            hotelId,
        });
        await this.invalidateCache(hotelId, data.roomTypeId);
        return RoomMapper.toResponseDto(newRoom);
    }
    async updateRoom(ownerId, id, data) {
        const room = await this.verifyRoomOwnership(id, ownerId);
        if (data.roomNumber && data.roomNumber !== room.roomNumber) {
            const exists = await this.roomRepo.existsByNumber(room.hotelId, data.roomNumber);
            if (exists) {
                throw new BadRequestError(`Số phòng ${data.roomNumber} đã tồn tại trong khách sạn này.`);
            }
        }
        const updatedRoom = await this.roomRepo.update(id, data);
        await this.invalidateCache(room.hotelId, room.roomTypeId, id);
        return RoomMapper.toResponseDto(updatedRoom);
    }
    async deleteRoom(ownerId, id) {
        const room = await this.verifyRoomOwnership(id, ownerId);
        await this.roomRepo.delete(id);
        await this.invalidateCache(room.hotelId, room.roomTypeId, id);
    }
    async getRoomById(id) {
        const cacheKey = REDIS_KEYS.ROOM(id);
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData)
            return JSON.parse(cachedData);
        const room = await this.roomRepo.findById(id);
        if (!room)
            throw new NotFoundError("Không tìm thấy phòng.");
        const response = RoomMapper.toResponseDto(room);
        await redisClient.setex(cacheKey, REDIS_TTL.ROOM, JSON.stringify(response));
        return response;
    }
    async getRoomsByHotel(hotelId) {
        const cacheKey = REDIS_KEYS.ROOMS_BY_HOTEL(hotelId);
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData)
            return JSON.parse(cachedData);
        const rooms = await this.roomRepo.findByHotelId(hotelId);
        const response = RoomMapper.toResponseDtoList(rooms);
        await redisClient.setex(cacheKey, REDIS_TTL.ROOM, JSON.stringify(response));
        return response;
    }
    async getRoomsByRoomType(roomTypeId) {
        const cacheKey = REDIS_KEYS.ROOMS_BY_ROOM_TYPE(roomTypeId);
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData)
            return JSON.parse(cachedData);
        const rooms = await this.roomRepo.findByRoomTypeId(roomTypeId);
        const response = RoomMapper.toResponseDtoList(rooms);
        await redisClient.setex(cacheKey, REDIS_TTL.ROOM, JSON.stringify(response));
        return response;
    }
}
