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
  hotelId: string;
  name: string;
  description: string | null;
  price: number;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  bedCount: number;
  area: number | null;
  isActive: boolean;
  thumbnail?: string | null;
  amenities?: string[];
  totalRooms?: number;
  images?: HotelImage[];
}

export interface HotelImage {
  id: string;
  imageUrl: string;
}

export interface Hotel {
  id: string;
  ownerId?: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  description: string | null;
  propertyType: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  images: HotelImage[];
  roomTypes: RoomType[];
  thumbnail?: string | null;
  rating?: number;
  amenities?: string[];
  phone?: string | null;
  email?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type HotelStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";
export type PropertyType = "HOTEL" | "RESORT" | "VILLA" | "APARTMENT" | "HOMESTAY" | "GUESTHOUSE" | "MOTEL" | "CAMPING" | "GLAMPING" | "CRUISE" | "ENTIRE_HOUSE";
export type BedType = "SINGLE" | "DOUBLE" | "QUEEN" | "KING" | "TWIN" | "BUNK";
export type RoomStatus = "AVAILABLE" | "BOOKED" | "OCCUPIED" | "MAINTENANCE";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number | null;
  status: RoomStatus;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  paymentMethod?: "VNPAY" | "MOMO" | "ZALOPAY" | "CREDIT_CARD" | "PAY_AT_HOTEL";
  paymentDate?: string | null;
  transactionId?: string | null;
  specialRequests?: string | null;
  createdAt?: string;
  updatedAt?: string;
  hotel?: { id: string; name: string; address?: string; city?: string; images?: { imageUrl: string }[] };
  roomType?: { id: string; name: string };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AvailableRoomType {
  id: string;
  name: string;
  price: number;
  maxAdults: number;
  maxChildren: number;
  bedCount: number;
  bedType: string;
  availableRooms: number;
  thumbnail: string | null;
}

export interface SearchHotel {
  id: string;
  name: string;
  thumbnail: string | null;
  rating: number;
  address: string;
  city: string;
  propertyType: string;
  amenities: string[];
  images: string[];
  startingPrice: number;
  availableRoomTypes: AvailableRoomType[];
}

export interface SearchHotelsParams {
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  rooms?: number;
}
