-- =============================================================================
-- NESTBOOKING COMPREHENSIVE SQL SEED SCRIPT (seed.sql)
-- Complete SQL queries with ON CONFLICT handling for PostgreSQL & Prisma
-- =============================================================================

-- 1. USERS & USER PROFILES
-- Password for all demo accounts: 123456
-- Hash: $2b$10$avrjBJN3GdhMtrMzKUSZ5e1tIjhjFl2MeSTR/QyAyUzwWC2hy7d9m

INSERT INTO "users" ("id", "email", "password_hash", "role", "status", "login_attempts", "created_at", "updated_at")
VALUES 
  ('11111111-1111-4111-a111-111111111111', 'admin@booking.com', '$2b$10$avrjBJN3GdhMtrMzKUSZ5e1tIjhjFl2MeSTR/QyAyUzwWC2hy7d9m', 'ADMIN', 'ACTIVE', 0, NOW(), NOW()),
  ('22222222-2222-4222-a222-222222222222', 'agent1@booking.com', '$2b$10$avrjBJN3GdhMtrMzKUSZ5e1tIjhjFl2MeSTR/QyAyUzwWC2hy7d9m', 'AGENT', 'ACTIVE', 0, NOW(), NOW()),
  ('22222222-2222-4222-a222-333333333333', 'agent2@booking.com', '$2b$10$avrjBJN3GdhMtrMzKUSZ5e1tIjhjFl2MeSTR/QyAyUzwWC2hy7d9m', 'AGENT', 'ACTIVE', 0, NOW(), NOW()),
  ('33333333-3333-4333-a333-111111111111', 'user1@booking.com', '$2b$10$avrjBJN3GdhMtrMzKUSZ5e1tIjhjFl2MeSTR/QyAyUzwWC2hy7d9m', 'USER', 'ACTIVE', 0, NOW(), NOW()),
  ('33333333-3333-4333-a333-222222222222', 'user2@booking.com', '$2b$10$avrjBJN3GdhMtrMzKUSZ5e1tIjhjFl2MeSTR/QyAyUzwWC2hy7d9m', 'USER', 'ACTIVE', 0, NOW(), NOW())
ON CONFLICT ("email") DO UPDATE 
SET "password_hash" = EXCLUDED."password_hash", "status" = 'ACTIVE', "updated_at" = NOW();

INSERT INTO "user_profiles" ("user_id", "full_name", "phone_number", "avatar_url", "address", "created_at", "updated_at")
VALUES
  ('11111111-1111-4111-a111-111111111111', 'NestBooking Administrator', '0900000001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', 'Quận Ba Đình, Hà Nội', NOW(), NOW()),
  ('22222222-2222-4222-a222-222222222222', 'Nguyễn Văn Agent (Chủ KS)', '0900000002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', 'Quận Hoàn Kiếm, Hà Nội', NOW(), NOW()),
  ('22222222-2222-4222-a222-333333333333', 'Trần Thị Đối Tác', '0900000003', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300', 'Quận Sơn Trà, Đà Nẵng', NOW(), NOW()),
  ('33333333-3333-4333-a333-111111111111', 'Lê Hoàng Khách Hàng', '0900000005', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', 'Quận 1, TP. Hồ Chí Minh', NOW(), NOW()),
  ('33333333-3333-4333-a333-222222222222', 'Phạm Minh Anh', '0900000006', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', 'Quận Cầu Giấy, Hà Nội', NOW(), NOW())
ON CONFLICT ("user_id") DO UPDATE 
SET "full_name" = EXCLUDED."full_name", "phone_number" = EXCLUDED."phone_number", "avatar_url" = EXCLUDED."avatar_url", "address" = EXCLUDED."address", "updated_at" = NOW();


-- 2. DESTINATIONS (Điểm đến du lịch)
INSERT INTO "destinations" ("id", "name", "slug", "image_url", "country", "country_flag", "description", "is_active", "is_featured", "created_at", "updated_at")
VALUES
  ('d1111111-1111-4111-a111-111111111111', 'Hà Nội', 'ha-noi', 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&q=80&w=1200', 'Vietnam', 'VN', 'Thủ đô ngàn năm văn hiến với phố cổ kính và ẩm thực phong phú', true, true, NOW(), NOW()),
  ('d2222222-2222-4222-a222-222222222222', 'Hạ Long', 'ha-long', 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200', 'Vietnam', 'VN', 'Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ', true, true, NOW(), NOW()),
  ('d3333333-3333-4333-a333-333333333333', 'Đà Nẵng', 'da-nang', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=1200', 'Vietnam', 'VN', 'Thành phố đáng sống với những bãi biển quyến rũ và Cầu Vàng nổi tiếng', true, true, NOW(), NOW()),
  ('d4444444-4444-4444-a444-444444444444', 'Ninh Bình', 'ninh-binh', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&q=80&w=1200', 'Vietnam', 'VN', 'Cố đô Tràng An - Hạ Long trên cạn xinh đẹp', true, true, NOW(), NOW()),
  ('d5555555-5555-4555-a555-555555555555', 'Cát Bà', 'cat-ba', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200', 'Vietnam', 'VN', 'Đảo ngọc hoang sơ với Vịnh Lan Hạ tuyệt đẹp', true, true, NOW(), NOW()),
  ('d6666666-6666-4666-a666-666666666666', 'Phú Quốc', 'phu-quoc', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200', 'Vietnam', 'VN', 'Đảo Ngọc thiên đường nghỉ dưỡng ven biển phía Nam', true, false, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE 
SET "name" = EXCLUDED."name", "image_url" = EXCLUDED."image_url", "description" = EXCLUDED."description", "updated_at" = NOW();


INSERT INTO "hotels" ("id", "owner_id", "name", "slug", "description", "address", "city", "country", "latitude", "longitude", "phone", "email", "thumbnail", "amenities", "rating", "check_in_time", "check_out_time", "status", "property_type", "created_at", "updated_at")
VALUES
  (
    'h1111111-1111-4111-a111-111111111111',
    '22222222-2222-4222-a222-222222222222',
    'The Hanoi Club Hotel & Residences',
    'the-hanoi-club-hotel-residences',
    'Khách sạn & Căn hộ cao cấp bên Hồ Tây tĩnh lặng với tầm nhìn toàn cảnh tuyệt đẹp, hồ bơi vô cực và dịch vụ đẳng cấp 5 sao.',
    '76 Yên Phụ, Tây Hồ, Hà Nội',
    'Hà Nội',
    'Vietnam',
    21.0512, 105.8364,
    '02438293829',
    'reservation@hanoiclub.com',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=900',
    ARRAY['Wifi miễn phí', 'Hồ bơi ngoài trời', 'Phòng Gym', 'Nhà hàng', 'Bãi đỗ xe', 'Dịch vụ đưa đón sân bay'],
    4.8, '14:00', '12:00', 'ACTIVE', 'HOTEL', NOW(), NOW()
  ),
  (
    'h2222222-2222-4222-a222-222222222222',
    '22222222-2222-4222-a222-222222222222',
    'Sapa Classic Mountain Retreat',
    'sapa-classic-mountain-retreat',
    'Khu nghỉ dưỡng nép mình giữa thung lũng Mường Hoa hoang sơ với góc nhìn mây vờn đỉnh Fansipan quyến rũ.',
    '08 Mường Hoa, Thị trấn Sapa, Lào Cai',
    'Sapa',
    'Vietnam',
    22.3364, 103.8438,
    '02143871234',
    'info@sapaclassic.com',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=900',
    ARRAY['Wifi miễn phí', 'Sưởi ấm', 'Nhà hàng đặc sản', 'Ban công ngắm núi', 'Buffet sáng'],
    4.7, '14:00', '12:00', 'ACTIVE', 'RESORT', NOW(), NOW()
  ),
  (
    'h3333333-3333-4333-a333-333333333333',
    '22222222-2222-4222-a222-333333333333',
    'Ha Long Luxury Grand Cruise',
    'ha-long-luxury-grand-cruise',
    'Du thuyền 5 sao đẳng cấp thế giới rẽ sóng đưa du khách khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long & Vịnh Lan Hạ.',
    'Cảng tàu khách quốc tế Tuần Châu, Hạ Long, Quảng Ninh',
    'Hạ Long',
    'Vietnam',
    20.9167, 107.0000,
    '0333849999',
    'booking@halongcruise.com',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=900',
    ARRAY['Wifi miễn phí', 'Sân sundeck ngắm cảnh', 'Chèo thuyền Kayak', 'Nhà hàng Hải sản', 'Spa & Massage'],
    4.9, '12:00', '11:00', 'ACTIVE', 'CRUISE', NOW(), NOW()
  ),
  (
    'h4444444-4444-4444-a444-444444444444',
    '22222222-2222-4222-a222-333333333333',
    'Danang Beachfront Sea Villa',
    'danang-beachfront-sea-villa',
    'Biệt thự nguyên căn sang trọng nằm ngay sát bờ biển Mỹ Khê Đà Nẵng với hồ bơi riêng và sân vườn xanh mát.',
    ' Võ Nguyên Giáp, Quận Ngũ Hành Sơn, Đà Nẵng',
    'Đà Nẵng',
    'Vietnam',
    16.0471, 108.2467,
    '0905123456',
    'contact@danangseavilla.com',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=900',
    ARRAY['Hồ bơi riêng', 'Wifi miễn phí', 'BBQ sân vườn', 'Bếp hiện đại', 'Sát biển', 'Bãi đỗ xe ô tô'],
    4.8, '14:00', '12:00', 'ACTIVE', 'VILLA', NOW(), NOW()
  )
ON CONFLICT ("slug") DO UPDATE 
SET "name" = EXCLUDED."name", "description" = EXCLUDED."description", "rating" = EXCLUDED."rating", "updated_at" = NOW();


-- 4. HOTEL IMAGES
INSERT INTO "hotel_images" ("id", "hotel_id", "image_url", "created_at", "updated_at")
VALUES
  ('img1-1', 'h1111111-1111-4111-a111-111111111111', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=900', NOW(), NOW()),
  ('img1-2', 'h1111111-1111-4111-a111-111111111111', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=900', NOW(), NOW()),
  ('img2-1', 'h2222222-2222-4222-a222-222222222222', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=900', NOW(), NOW()),
  ('img3-1', 'h3333333-3333-4333-a333-333333333333', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=900', NOW(), NOW()),
  ('img4-1', 'h4444444-4444-4444-a444-444444444444', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=900', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;



INSERT INTO "room_types" ("id", "hotel_id", "name", "description", "price", "max_guests", "max_adults", "max_children", "bed_type", "bed_count", "area", "thumbnail", "is_active", "amenities", "created_at", "updated_at")
VALUES
  (
    'rt111111-1111-4111-a111-111111111111',
    'h1111111-1111-4111-a111-111111111111',
    'Deluxe Westlake View',
    'Phòng Deluxe hướng nhìn Hồ Tây thơ mộng với giường King lớn và bồn tắm sang trọng.',
    1250000.00, 2, 2, 1, 'KING', 1, 35.0,
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800',
    true, ARRAY['View Hồ Tây', 'Bồn tắm', 'Wifi tốc độ cao', 'Tủ lạnh mini', 'Điều hòa 2 chiều'], NOW(), NOW()
  ),
  (
    'rt111111-1111-4111-a111-222222222222',
    'h1111111-1111-4111-a111-111111111111',
    'Executive Suite City View',
    'Căn Suite cao cấp với phòng khách riêng biệt, thiết kế hiện đại ấm cúng.',
    2150000.00, 3, 2, 2, 'KING', 1, 55.0,
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
    true, ARRAY['Phòng khách riêng', 'Ban công', 'Máy pha cà phê', 'Dịch vụ buồng phòng 24/7'], NOW(), NOW()
  ),
  (
    'rt222222-2222-4222-a222-111111111111',
    'h2222222-2222-4222-a222-222222222222',
    'Mountain View Bungalow',
    'Bungalow gỗ ấm áp ngắm nhìn thung lũng ruộng bậc thang Sapa.',
    890000.00, 2, 2, 1, 'QUEEN', 1, 30.0,
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800',
    true, ARRAY['Ban công săn mây', 'Lò sưởi', 'Trà & Cà phê miễn phí'], NOW(), NOW()
  ),
  (
    'rt333333-3333-4333-a333-111111111111',
    'h3333333-3333-4333-a333-333333333333',
    'Ocean Balcony Suite Cabin',
    'Cabin du thuyền cao cấp với ban công riêng trổ ra khung cảnh Vịnh Hạ Long kỳ vĩ.',
    3450000.00, 2, 2, 1, 'KING', 1, 38.0,
    'https://images.unsplash.com/photo-1540518614846-7ede433c517a?auto=format&fit=crop&q=80&w=800',
    true, ARRAY['Ban công sát biển', 'Bồn tắm Jacuzzi', 'Trọn gói bữa ăn hải sản'], NOW(), NOW()
  ),
  (
    'rt444444-4444-4444-a444-111111111111',
    'h4444444-4444-4444-a444-444444444444',
    'Entire 4-Bedroom Beachfront Villa',
    'Nguyên căn biệt thự 4 phòng ngủ cao cấp dành cho gia đình hoặc nhóm bạn 8-10 người.',
    6800000.00, 10, 8, 4, 'KING', 4, 280.0,
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800',
    true, ARRAY['Hồ bơi riêng', 'Sân vườn BBQ', '4 Phòng ngủ khép kín', 'Bếp nấu ăn đầy đủ'], NOW(), NOW()
  )
ON CONFLICT ("hotel_id", "name") DO UPDATE 
SET "price" = EXCLUDED."price", "description" = EXCLUDED."description", "updated_at" = NOW();


INSERT INTO "rooms" ("id", "hotel_id", "room_type_id", "room_number", "floor", "status", "is_active", "created_at", "updated_at")
VALUES
  ('rm101', 'h1111111-1111-4111-a111-111111111111', 'rt111111-1111-4111-a111-111111111111', '101', 1, 'AVAILABLE', true, NOW(), NOW()),
  ('rm102', 'h1111111-1111-4111-a111-111111111111', 'rt111111-1111-4111-a111-111111111111', '102', 1, 'AVAILABLE', true, NOW(), NOW()),
  ('rm201', 'h1111111-1111-4111-a111-111111111111', 'rt111111-1111-4111-a111-222222222222', '201', 2, 'AVAILABLE', true, NOW(), NOW()),
  ('rm202', 'h1111111-1111-4111-a111-111111111111', 'rt111111-1111-4111-a111-222222222222', '202', 2, 'AVAILABLE', true, NOW(), NOW()),
  ('rm-sapa-01', 'h2222222-2222-4222-a222-222222222222', 'rt222222-2222-4222-a222-111111111111', 'BG-01', 1, 'AVAILABLE', true, NOW(), NOW()),
  ('rm-sapa-02', 'h2222222-2222-4222-a222-222222222222', 'rt222222-2222-4222-a222-111111111111', 'BG-02', 1, 'AVAILABLE', true, NOW(), NOW()),
  ('rm-cruise-101', 'h3333333-3333-4333-a333-333333333333', 'rt333333-3333-4333-a333-111111111111', 'C-101', 1, 'AVAILABLE', true, NOW(), NOW()),
  ('rm-villa-01', 'h4444444-4444-4444-a444-444444444444', 'rt444444-4444-4444-a444-111111111111', 'VILLA-A', 1, 'AVAILABLE', true, NOW(), NOW())
ON CONFLICT ("hotel_id", "room_number") DO UPDATE SET "status" = 'AVAILABLE', "updated_at" = NOW();



INSERT INTO "bookings" ("id", "booking_code", "user_id", "hotel_id", "room_type_id", "check_in_date", "check_out_date", "quantity", "total_amount", "status", "payment_method", "payment_status", "payment_date", "transaction_id", "guest_name", "guest_phone", "guest_email", "special_requests", "created_at", "updated_at")
VALUES
  (
    'b1111111-1111-4111-a111-111111111111',
    'BK-NEST-2026-001',
    '33333333-3333-4333-a333-111111111111',
    'h1111111-1111-4111-a111-111111111111',
    'rt111111-1111-4111-a111-111111111111',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '3 days',
    1, 2500000.00, 'CONFIRMED', 'VNPAY', 'PAID', NOW(), 'VNPAY-TX-998877',
    'Lê Hoàng Khách Hàng', '0900000005', 'user1@booking.com', 'Xin phòng tầng cao view thoáng', NOW(), NOW()
  ),
  (
    'b2222222-2222-4222-a222-222222222222',
    'BK-NEST-2026-002',
    '33333333-3333-4333-a333-222222222222',
    'h2222222-2222-4222-a222-222222222222',
    'rt222222-2222-4222-a222-111111111111',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '7 days',
    1, 1780000.00, 'PENDING', 'PAY_AT_HOTEL', 'UNPAID', NULL, NULL,
    'Phạm Minh Anh', '0900000006', 'user2@booking.com', 'Chuẩn bị trà đón tiếp', NOW(), NOW()
  )
ON CONFLICT ("booking_code") DO NOTHING;

INSERT INTO "booking_rooms" ("booking_id", "room_id")
VALUES
  ('b1111111-1111-4111-a111-111111111111', 'rm101')
ON CONFLICT ("booking_id", "room_id") DO NOTHING;


-- 8. REVIEWS & NOTIFICATIONS
INSERT INTO "reviews" ("id", "user_id", "hotel_id", "rating", "comment", "created_at", "updated_at")
VALUES
  ('rev-1', '33333333-3333-4333-a333-111111111111', 'h1111111-1111-4111-a111-111111111111', 5, 'Khách sạn rất đẹp, view Hồ Tây đón bình minh cực chill! Nhân viên phục vụ nhiệt tình chu đáo.', NOW(), NOW()),
  ('rev-2', '33333333-3333-4333-a333-222222222222', 'h2222222-2222-4222-a222-222222222222', 4, 'Bungalow sạch sẽ, không khí mây núi Sapa tuyệt vời. Nhất định sẽ quay lại!', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "is_read", "created_at")
VALUES
  ('notif-1', '33333333-3333-4333-a333-111111111111', 'Đặt phòng thành công', 'Đơn đặt phòng BK-NEST-2026-001 tại The Hanoi Club Hotel đã được xác nhận thanh toán thành công qua VNPay.', 'BOOKING_SUCCESS', false, NOW()),
  ('notif-2', '22222222-2222-4222-a222-222222222222', 'Đơn đặt phòng mới', 'Khách sạn của bạn vừa nhận được đơn đặt phòng BK-NEST-2026-001 từ khách hàng Lê Hoàng Khách Hàng.', 'BOOKING_SUCCESS', false, NOW())
ON CONFLICT ("id") DO NOTHING;

-- Done seeding!
