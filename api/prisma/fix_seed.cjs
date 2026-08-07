const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'seed.sql');
let sql = fs.readFileSync(file, 'utf8');

const replacements = {
  // Destination
  '"image_url"': '"imageUrl"',
  '"country_flag"': '"countryFlag"',
  '"is_active"': '"isActive"',
  '"is_featured"': '"isFeatured"',
  // Hotel
  '"owner_id"': '"ownerId"',
  '"check_in_time"': '"checkInTime"',
  '"check_out_time"': '"checkOutTime"',
  // HotelImage
  '"hotel_id"': '"hotelId"',
  // RoomType
  '"max_guests"': '"maxGuests"',
  '"max_adults"': '"maxAdults"',
  '"max_children"': '"maxChildren"',
  '"bed_type"': '"bedType"',
  '"bed_count"': '"bedCount"',
  // Room
  '"room_type_id"': '"roomTypeId"',
  '"room_number"': '"roomNumber"',
  // BookingRoom
  '"booking_id"': '"bookingId"',
  '"room_id"': '"roomId"',
};

for (const [find, replace] of Object.entries(replacements)) {
  sql = sql.split(find).join(replace);
}

const tablesToFixTimestamps = ['destinations', 'hotels', 'hotel_images', 'room_types', 'rooms', 'room_type_images'];
for (const table of tablesToFixTimestamps) {
  const regex = new RegExp(`INSERT INTO "${table}" \\(([^)]+)\\)`, 'g');
  sql = sql.replace(regex, (match, cols) => {
    let newCols = cols.replace(/"created_at"/g, '"createdAt"').replace(/"updated_at"/g, '"updatedAt"');
    return `INSERT INTO "${table}" (${newCols})`;
  });
}

sql = sql.replace(/ON CONFLICT \("slug"\) DO UPDATE \nSET "name" = EXCLUDED."name", "image_url" = EXCLUDED."image_url", "description" = EXCLUDED."description", "updated_at" = NOW\(\);/g, 'ON CONFLICT ("slug") DO UPDATE \nSET "name" = EXCLUDED."name", "imageUrl" = EXCLUDED."imageUrl", "description" = EXCLUDED."description", "updatedAt" = NOW();');
sql = sql.replace(/ON CONFLICT \("slug"\) DO UPDATE \nSET "name" = EXCLUDED."name", "description" = EXCLUDED."description", "rating" = EXCLUDED."rating", "updated_at" = NOW\(\);/g, 'ON CONFLICT ("slug") DO UPDATE \nSET "name" = EXCLUDED."name", "description" = EXCLUDED."description", "rating" = EXCLUDED."rating", "updatedAt" = NOW();');
sql = sql.replace(/ON CONFLICT \("hotel_id", "name"\) DO UPDATE \nSET "price" = EXCLUDED."price", "description" = EXCLUDED."description", "updated_at" = NOW\(\);/g, 'ON CONFLICT ("hotelId", "name") DO UPDATE \nSET "price" = EXCLUDED."price", "description" = EXCLUDED."description", "updatedAt" = NOW();');
sql = sql.replace(/ON CONFLICT \("hotel_id", "room_number"\) DO UPDATE SET "status" = 'AVAILABLE', "updated_at" = NOW\(\);/g, 'ON CONFLICT ("hotelId", "roomNumber") DO UPDATE SET "status" = \'AVAILABLE\', "updatedAt" = NOW();');

fs.writeFileSync(file, sql, 'utf8');
console.log('seed.sql updated in place!');
