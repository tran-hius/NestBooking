import { Hotel, HotelStatus } from "generated/prisma";
import {
  CreateHotelDto,
  HotelResponseDto,
  UpdateHotelDto,
} from "../dtos/hotelDto";
import { IHotelRepository } from "../interfaces/IHotelRepository";
import { IHotelService } from "../interfaces/IHotelService";
import { HotelMapper } from "../mapper/HotelMapper";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors/errorCustomize";
import logger from "@/utils/logger";
import { PaginatedResponse } from "../dtos/PaginationDto";

export class HotelService implements IHotelService {
  private readonly hotelRepository: IHotelRepository;

  constructor(hotelRepository: IHotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async createHotel(
    ownerId: string,
    data: CreateHotelDto,
  ): Promise<HotelResponseDto> {
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

  async getHotelsByAgent(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<HotelResponseDto>> {

    const skip = (page - 1) * limit;

    const [hotels, total] = await Promise.all([
      this.hotelRepository.findMany({
        where: { ownerId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
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

  async getHotelById(
    id: string,
    ownerId?: string,
  ): Promise<HotelResponseDto | null> {
    const hotel = await this.hotelRepository.findById(id);

    if (!hotel || hotel.deletedAt) {
      throw new NotFoundError(
        "Không tìm thấy khách sạn hoặc khách sạn đã bị xóa.",
      );
    }
    if (ownerId && hotel.ownerId !== ownerId) {
      throw new ForbiddenError(
        "Bạn không có quyền xem thông tin nội bộ của khách sạn này.",
      );
    }
    return HotelMapper.toResponseDto(hotel);
  }

  async updateHotel(
    id: string,
    ownerId: string,
    data: UpdateHotelDto,
  ): Promise<HotelResponseDto> {
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
    return HotelMapper.toResponseDto(updatedHotel);
  }

  async softDeleteHotel(id: string, ownerId: string): Promise<void> {
    logger.warn(`Thực hiện xóa mềm hotel ID: ${id}`);
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel || hotel.deletedAt) {
      throw new NotFoundError("Không tìm thấy khách sạn.");
    }
    if (hotel.ownerId !== ownerId) {
      throw new ForbiddenError("Bạn không có quyền xóa khách sạn này.");
    }
    await this.hotelRepository.delete(id);
    logger.info(`Đã ẩn hoàn toàn hotel ID ${id} ra khỏi hệ thống.`);
  }

  async restoreHotel(id: string, ownerId: string): Promise<HotelResponseDto> {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel || hotel.ownerId !== ownerId) {
      throw new NotFoundError(
        "Khách sạn không tồn tại hoặc bạn không có quyền.",
      );
    }
    const restoredHotel = await this.hotelRepository.restore(id, ownerId);
    return HotelMapper.toResponseDto(restoredHotel);
  }

  async getAllHotels(
    query: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<HotelResponseDto>> {
    const skip = (page - 1) * limit;

    const [hotels, total] = await Promise.all([
      this.hotelRepository.findMany({
        where: { ...query, deletedAt: null },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
      }),
      this.hotelRepository.count({
        where: { ...query, deletedAt: null },
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
}
