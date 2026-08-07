const fs = require('fs');

let schema = fs.readFileSync('schema.prisma', 'utf8');

// A mapping of camelCase field names to their snake_case equivalents that need @map
const replacements = {
  // Destination
  'imageUrl    String   @db.Text': 'imageUrl    String   @map("image_url") @db.Text',
  'countryFlag String   @default("VN") @db.VarChar(10)': 'countryFlag String   @default("VN") @map("country_flag") @db.VarChar(10)',
  'isActive    Boolean  @default(true)': 'isActive    Boolean  @default(true) @map("is_active")',
  'isFeatured  Boolean  @default(false)': 'isFeatured  Boolean  @default(false) @map("is_featured")',
  'createdAt   DateTime @default(now())': 'createdAt   DateTime @default(now()) @map("created_at")',
  'updatedAt   DateTime @updatedAt': 'updatedAt   DateTime @updatedAt @map("updated_at")',
  
  // General timestamps across models without map
  'deletedAt    DateTime?': 'deletedAt    DateTime? @map("deleted_at")',
  'deletedAt DateTime?': 'deletedAt DateTime? @map("deleted_at")',
  
  // Hotel
  'ownerId      String       @db.Uuid': 'ownerId      String       @map("owner_id") @db.Uuid',
  'checkInTime  String?      @db.VarChar(10)': 'checkInTime  String?      @map("check_in_time") @db.VarChar(10)',
  'checkOutTime String?      @db.VarChar(10)': 'checkOutTime String?      @map("check_out_time") @db.VarChar(10)',
  
  // HotelImage
  'hotelId   String   @db.Uuid': 'hotelId   String   @map("hotel_id") @db.Uuid',
  
  // RoomType
  'hotelId     String          @db.Uuid': 'hotelId     String          @map("hotel_id") @db.Uuid',
  'maxGuests   Int': 'maxGuests   Int @map("max_guests")',
  'maxAdults   Int': 'maxAdults   Int @map("max_adults")',
  'maxChildren Int': 'maxChildren Int @map("max_children")',
  'bedType     BedType': 'bedType     BedType @map("bed_type")',
  'bedCount    Int': 'bedCount    Int @map("bed_count")',
  
  // Room
  'roomTypeId String     @db.Uuid': 'roomTypeId String     @map("room_type_id") @db.Uuid',
  'roomNumber String     @db.VarChar(30)': 'roomNumber String     @map("room_number") @db.VarChar(30)',
  
  // BookingRoom
  'bookingId String @db.Uuid': 'bookingId String @map("booking_id") @db.Uuid',
  'roomId    String @db.Uuid': 'roomId    String @map("room_id") @db.Uuid',
  
  // RoomTypeImage
  'roomTypeId String   @db.Uuid': 'roomTypeId String   @map("room_type_id") @db.Uuid',
  
  // Booking
  'userId     String @db.Uuid': 'userId     String @map("user_id") @db.Uuid',
  'hotelId    String @db.Uuid': 'hotelId    String @map("hotel_id") @db.Uuid',
  
  // Review
  'userId    String   @db.Uuid': 'userId    String   @map("user_id") @db.Uuid',
  
  // Notification
  'userId    String           @db.Uuid': 'userId    String           @map("user_id") @db.Uuid',
};

for (const [find, replace] of Object.entries(replacements)) {
  // Use regex to replace globally just in case, or string replace
  schema = schema.split(find).join(replace);
}

fs.writeFileSync('schema.prisma', schema, 'utf8');
console.log('Schema fixed!');
