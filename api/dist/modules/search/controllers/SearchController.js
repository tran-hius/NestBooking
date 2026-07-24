export class SearchController {
    searchService;
    constructor(searchService) {
        this.searchService = searchService;
    }
    searchHotels = async (req, res) => {
        // Transform query string to DTO
        const dto = new SearchHotelDto();
        Object.assign(dto, req.query);
        const result = await this.searchService.searchHotels(dto);
        res.status(200).json(result);
    };
}
