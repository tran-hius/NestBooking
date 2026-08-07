-- CreateTable
CREATE TABLE "booking_rooms" (
    "bookingId" UUID NOT NULL,
    "roomId" UUID NOT NULL,

    CONSTRAINT "booking_rooms_pkey" PRIMARY KEY ("bookingId","roomId")
);

-- AddForeignKey
ALTER TABLE "booking_rooms" ADD CONSTRAINT "booking_rooms_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_rooms" ADD CONSTRAINT "booking_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
