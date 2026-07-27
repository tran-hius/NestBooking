import { Request, Response, NextFunction } from "express";
import { IDestinationService } from "../interfaces/IDestinationService";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";

import { uploadToCloudinary } from "@/utils/cloudinary.utils";

export class DestinationController {
  constructor(private readonly destinationService: IDestinationService) {}

  getActiveDestinations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destinations = await this.destinationService.getActiveDestinations();
      successResponse(res, HttpStatus.OK, "Lấy danh sách điểm đến thành công", destinations);
    } catch (error) {
      next(error);
    }
  };

  getAllDestinations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destinations = await this.destinationService.getAllDestinations();
      successResponse(res, HttpStatus.OK, "Lấy toàn bộ điểm đến thành công", destinations);
    } catch (error) {
      next(error);
    }
  };

  createDestination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let imageUrl = req.body.imageUrl;
      if (req.file) {
        const slug = req.body.slug || 'destination';
        imageUrl = await uploadToCloudinary(req.file.buffer, `destinations/${slug}-${Date.now()}`);
      }

      const destinationData = {
        ...req.body,
        imageUrl,
      };

      const destination = await this.destinationService.createDestination(destinationData);
      successResponse(res, HttpStatus.CREATED, "Tạo điểm đến thành công", destination);
    } catch (error) {
      next(error);
    }
  };

  updateDestination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const destination = await this.destinationService.updateDestination(id, req.body);
      successResponse(res, HttpStatus.OK, "Cập nhật điểm đến thành công", destination);
    } catch (error) {
      next(error);
    }
  };

  deleteDestination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.destinationService.deleteDestination(id);
      successResponse(res, HttpStatus.OK, "Xóa điểm đến thành công", null);
    } catch (error) {
      next(error);
    }
  };

  toggleFeatured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const destination = await this.destinationService.toggleFeatured(id);
      successResponse(res, HttpStatus.OK, "Cập nhật trạng thái nổi bật thành công", destination);
    } catch (error) {
      next(error);
    }
  };
}
