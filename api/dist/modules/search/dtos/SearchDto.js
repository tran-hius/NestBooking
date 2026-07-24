import { z } from "zod/v3";
import { PropertyType } from "@/../generated/prisma";
export var SortByOption;
(function (SortByOption) {
    SortByOption["PRICE_ASC"] = "PRICE_ASC";
    SortByOption["PRICE_DESC"] = "PRICE_DESC";
    SortByOption["RATING_DESC"] = "RATING_DESC";
})(SortByOption || (SortByOption = {}));
export const searchHotelSchema = z.object({
    query: z.object({
        location: z.string().optional(),
        checkInDate: z.string().datetime().optional(),
        checkOutDate: z.string().datetime().optional(),
        adults: z.coerce.number().int().min(1).optional().default(1),
        children: z.coerce.number().int().min(0).optional().default(0),
        rooms: z.coerce.number().int().min(1).optional().default(1),
        minPrice: z.coerce.number().min(0).optional(),
        maxPrice: z.coerce.number().min(0).optional(),
        propertyType: z.nativeEnum(PropertyType).optional(),
        amenities: z.union([z.string(), z.array(z.string())]).optional(),
        sortBy: z.nativeEnum(SortByOption).optional(),
        page: z.coerce.number().int().min(1).optional().default(1),
        limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    })
});
