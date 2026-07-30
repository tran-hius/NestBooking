export enum Role {
  USER = "USER",
  AGENT = "AGENT",
  ADMIN = "ADMIN"
}

export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  REJECTED = "REJECTED",
  BANNED = "BANNED"
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  bedCount: number;
  area: number;
  hasWindow: boolean;
  hasBalcony: boolean;
  isActive: boolean;
}

export interface HotelImage {
  id: string;
  imageUrl: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  description: string;
  propertyType: string;
  starRating: number;
  latitude: number;
  longitude: number;
  status: string;
  images: HotelImage[];
  roomTypes: RoomType[];
  thumbnail?: string;
  rating?: number;
  amenities?: string[];
  availableRoomTypes?: { name: string; price: number }[];
}

export interface SearchHotelsParams {
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  rooms?: number;
}
