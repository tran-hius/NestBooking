import { Booking } from "../../../../generated/prisma";

export interface IBookingLockRepository {
  // Tìm kiếm và khoá record (Dùng Transaction "SELECT ... FOR UPDATE" trong Postgres)
  findForUpdate(id: string): Promise<Booking | null>;

  // Khoá loại phòng để đảm bảo không ai tranh mua
  lockRoomType(roomTypeId: string): Promise<void>;
}
