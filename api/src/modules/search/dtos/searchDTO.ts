import { z } from "zod/v3";
import { PropertyType } from "@/../generated/prisma";

export enum SortByOption {
  PRICE_ASC = "PRICE_ASC",
  PRICE_DESC = "PRICE_DESC",
  RATING_DESC = "RATING_DESC",
}

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
  }),
});

export type SearchHotelDto = z.infer<typeof searchHotelSchema>["query"];

export interface AvailableRoomTypeDto {
  id: string;
  name: string;
  price: number;
  maxAdults: number;
  maxChildren: number;
  availableRooms: number;
  thumbnail: string | null;
}

export interface SearchHotelResponseDto {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  thumbnail: string | null;
  rating: number;
  propertyType: string;
  amenities: string[];
  images: string[];
  startingPrice: number;
  availableRoomTypes: AvailableRoomTypeDto[];
}
