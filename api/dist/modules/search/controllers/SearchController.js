import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";
export class SearchController {
    searchService;
    constructor(searchService) {
        this.searchService = searchService;
    }
    searchHotels = async (req, res) => {
        logger.info("[SearchController] Search hotels", { query: req.query });
        const dto = req.query;
        const result = await this.searchService.searchHotels(dto);
        successResponse(res, HttpStatus.OK, "Tìm kiếm khách sạn thành công", result);
    };
    ;
}
