import { Request, Response } from "express";
import { ISearchService } from "../interfaces/ISearchRepository";
import { SearchHotelDto } from "../dtos/SearchDTO";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";

export class SearchController {
  private readonly searchService: ISearchService;

  constructor(searchService: ISearchService) {
    this.searchService = searchService;
  }

  searchHotels = async (req: Request, res: Response): Promise<void> => {
    logger.info("[SearchController] Search hotels", { query: req.query });

    const dto = req.query as unknown as SearchHotelDto;
    const result = await this.searchService.searchHotels(dto);

    successResponse(
      res,
      HttpStatus.OK,
      "Tìm kiếm khách sạn thành công",
      result,
    );
  };;
}
