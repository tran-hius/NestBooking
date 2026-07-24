import swaggerAutogen from "swagger-autogen";
import logger from "@/config/logger";
const services = [
    {
        name: "User Service",
        description: "Tài liệu API của riêng Module Users",
        basePath: "/api/users",
        outputFile: "./src/modules/user/docs/swagger-user.json",
        routerFiles: ["./src/modules/user/routes/UserRouter.ts"],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                CreateUserDto: {
                    $email: "user@example.com",
                    $fullName: "Nguyen Van A",
                    $role: "USER"
                },
                UpdateUserProfileDto: {
                    fullName: "Nguyen Van B",
                    phoneNumber: "0123456789",
                    avatarUrl: "https://example.com/avt.jpg",
                    address: "Ha Noi"
                },
                ChangeUserStatusDto: {
                    $status: "ACTIVE"
                },
                SubmitIdentityVerificationDto: {
                    $documentType: "CCCD",
                    $idNumber: "001002003004",
                    $idCardImageUrl: "https://example.com/id.jpg"
                },
                RejectIdentityVerificationDto: {
                    $reason: "Ảnh quá mờ"
                },
            },
        },
    },
    {
        name: "Auth Service",
        description: "Tài liệu API của riêng Module Auth",
        basePath: "/api/auth",
        outputFile: "./src/modules/auth/docs/swagger-auth.json",
        routerFiles: ["./src/modules/auth/routes/AuthRouter.ts"],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                SendOtpDto: {
                    $email: "user@example.com"
                },
                VerifyOtpDto: {
                    $otpToken: "uuid-1234",
                    $otp: "123456"
                },
                LoginWithPasswordDto: {
                    $email: "user@example.com",
                    $password: "123456"
                },
                ResetPasswordDto: {
                    $otpToken: "uuid-1234",
                    $otp: "123456",
                    $newPassword: "new_password_123"
                },
                ChangePasswordDto: {
                    $oldPassword: "old_password_123",
                    $newPassword: "new_password_123"
                },
            },
        },
    },
    {
        name: "Hotel Service",
        description: "Tài liệu API của riêng Module Khách sạn",
        basePath: "/api/hotels",
        outputFile: "./src/modules/hotel/docs/swagger-hotel.json",
        routerFiles: [
            "./src/modules/hotel/routes/HotelRouter.ts",
            "./src/modules/hotel/routes/RoomTypeRouter.ts",
            "./src/modules/hotel/routes/RoomRouter.ts"
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                CreateHotelDto: {
                    $name: "Khách sạn Mường Thanh",
                    description: "Khách sạn 5 sao...",
                    $address: "123 Đường Trần Phú",
                    $city: "Nha Trang",
                    country: "Vietnam",
                    latitude: 12.238791,
                    longitude: 109.196749,
                    phone: "0123456789",
                    email: "contact@muongthanh.com",
                    thumbnail: "https://example.com/image.jpg",
                    amenities: ["WIFI", "SWIMMING_POOL", "SPA", "GYM", "BAR"],
                    checkInTime: "14:00",
                    checkOutTime: "12:00",
                },
                UpdateHotelDto: {
                    name: "Khách sạn Mường Thanh",
                    description: "Khách sạn 5 sao...",
                    address: "123 Đường Trần Phú",
                    city: "Nha Trang",
                    country: "Vietnam",
                    amenities: ["WIFI", "SWIMMING_POOL"],
                    status: "ACTIVE",
                },
                CreateRoomTypeDto: {
                    $name: "Phòng Standard",
                    $price: 500000,
                    $maxGuests: 2,
                    $maxAdults: 2,
                    $maxChildren: 1,
                    $bedType: "SINGLE",
                    $bedCount: 1,
                    area: 25,
                    isActive: true,
                    amenities: ["WIFI", "AC"],
                },
                UpdateRoomTypeDto: {
                    name: "Phòng Standard",
                    price: 500000,
                    isActive: true,
                    amenities: ["WIFI", "AC"],
                },
                AddRoomTypeImagesDto: {
                    $imageUrls: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
                },
                CreateRoomDto: {
                    $roomTypeId: "uuid-1234",
                    $roomNumber: "101",
                    floor: 1,
                },
                UpdateRoomDto: {
                    roomNumber: "101",
                    floor: 1,
                    status: "AVAILABLE",
                },
            },
        },
    },
    {
        name: "Booking Service",
        description: "Tài liệu API của riêng Module Booking",
        basePath: "/api/bookings",
        outputFile: "./src/modules/booking/docs/swagger-booking.json",
        routerFiles: ["./src/modules/booking/routes/BookingRouter.ts"],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                CreateBookingDto: {
                    $hotelId: "uuid-1234",
                    $roomTypeId: "uuid-5678",
                    $checkInDate: "2024-12-01T14:00:00Z",
                    $checkOutDate: "2024-12-05T12:00:00Z",
                    $quantity: 2,
                    $guestName: "Nguyen Van A",
                    $guestPhone: "0123456789",
                    $guestEmail: "user@example.com",
                    specialRequests: "Gần cửa sổ"
                },
                UpdateBookingStatusDto: {
                    $status: "CONFIRMED"
                }
            }
        }
    }
];
const autogen = swaggerAutogen({ openapi: "3.0.0", autoHeaders: false });
for (const service of services) {
    const doc = {
        info: {
            title: `${service.name} API`,
            description: service.description,
            version: "1.0.0",
        },
        host: "localhost:3000",
        schemes: ["http"],
        basePath: "",
        components: service.components || {},
    };
    autogen(service.outputFile, service.routerFiles, doc).then(() => {
        logger.info(`Đã build thành công tài liệu Swagger cho [${service.name}]`);
    });
}
