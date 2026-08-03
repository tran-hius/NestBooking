import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
// Set default timezone for the application
export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
/**
 * Returns a dayjs instance set to the default timezone.
 * @param date Optional date string or Date object.
 */
export const tzDate = (date) => {
    return dayjs(date).tz(DEFAULT_TIMEZONE);
};
/**
 * Checks if a given date is strictly in the past (before today's 00:00:00 in local timezone).
 * @param date The date to check
 */
export const isPastDate = (date) => {
    const targetDate = tzDate(date).startOf("day");
    const today = tzDate().startOf("day");
    return targetDate.isBefore(today);
};
/**
 * Checks if checkIn date is valid relative to checkOut date.
 */
export const isValidDateRange = (checkIn, checkOut) => {
    const checkInDate = tzDate(checkIn).startOf("day");
    const checkOutDate = tzDate(checkOut).startOf("day");
    return checkInDate.isBefore(checkOutDate);
};
export default dayjs;
