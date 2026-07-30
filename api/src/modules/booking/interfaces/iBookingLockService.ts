export interface IBookingLockService {
  /**
   * Cố gắng lấy lock cho một roomTypeId.
   * Thử lại nhiều lần nếu lock đang bị giữ.
   */
  acquireLockWithRetry(roomTypeId: string, ttlMs?: number, maxRetries?: number, retryDelayMs?: number): Promise<string | null>;
  
  /**
   * Cố gắng lấy lock một lần duy nhất.
   */
  acquireLock(roomTypeId: string, ttlMs?: number): Promise<string | null>;

  /**
   * Giải phóng lock sau khi giao dịch hoàn thành.
   */
  releaseLock(roomTypeId: string, lockValue: string): Promise<boolean>;
}
