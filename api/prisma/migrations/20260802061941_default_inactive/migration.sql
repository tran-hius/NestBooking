-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'CHECKED_IN';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'INACTIVE';
