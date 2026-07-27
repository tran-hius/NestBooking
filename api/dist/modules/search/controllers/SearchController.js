import { successResponse } from "../../../utils/response.js";
import { HttpStatus } from "../../../constants/httpStatus.js";
import logger from "../../../config/logger.js";
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
