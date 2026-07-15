import swaggerAutogen from "swagger-autogen";

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
          type: "object",
          properties: {
            email: { type: "string", example: "user@example.com" },
            fullName: { type: "string", example: "Nguyen Van A" },
            role: { type: "string", example: "USER" },
          },
        },
        UpdateUserProfileDto: {
          type: "object",
          properties: {
            fullName: { type: "string", example: "Nguyen Van B" },
            phoneNumber: { type: "string", example: "0123456789" },
            avatarUrl: { type: "string", example: "https://example.com/avt.jpg" },
            address: { type: "string", example: "Ha Noi" },
          },
        },
        ChangeUserStatusDto: {
          type: "object",
          properties: {
            status: { type: "string", example: "ACTIVE" },
          },
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
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
          },
          required: ["email"],
        },
        VerifyOtpDto: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            otp: { type: "string", example: "123456" },
          },
          required: ["email", "otp"],
        },
        LoginWithPasswordDto: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: { type: "string", example: "123456" },
          },
          required: ["email", "password"],
        },
        ResetPasswordDto: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            otp: { type: "string", example: "123456" },
            newPassword: { type: "string", example: "new_password_123" },
          },
          required: ["email", "otp", "newPassword"],
        },
        ChangePasswordDto: {
          type: "object",
          properties: {
            oldPassword: { type: "string", example: "old_password_123" },
            newPassword: { type: "string", example: "new_password_123" },
          },
          required: ["newPassword"],
        },
      },
    },
  },
  {
    name: "Hotel Service",
    description: "Tài liệu API của riêng Module Khách sạn",
    basePath: "/api/hotels",
    outputFile: "./src/modules/hotel/docs/swagger-hotel.json",
    routerFiles: ["./src/modules/hotel/routes/HotelRouter.ts"],
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
          type: "object",
          properties: {
            name: { type: "string", example: "Khách sạn Mường Thanh" },
            description: { type: "string", example: "Khách sạn 5 sao..." },
            address: { type: "string", example: "123 Đường Trần Phú" },
            city: { type: "string", example: "Nha Trang" },
            country: { type: "string", example: "Vietnam" },
            latitude: { type: "number", example: 12.238791 },
            longitude: { type: "number", example: 109.196749 },
            phone: { type: "string", example: "0123456789" },
            email: { type: "string", example: "contact@muongthanh.com" },
            thumbnail: { type: "string", example: "https://example.com/image.jpg" },
            amenities: { type: "array", items: { type: "string" }, example: ["WIFI", "SWIMMING_POOL", "SPA", "GYM", "BAR"] },
            checkInTime: { type: "string", example: "14:00" },
            checkOutTime: { type: "string", example: "12:00" },
          },
          required: ["name", "address", "city"],
        },
        UpdateHotelDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            country: { type: "string" },
            amenities: { type: "array", items: { type: "string" } },
            status: { type: "string", enum: ["PENDING", "ACTIVE", "INACTIVE", "REJECTED"] },
          },
        },
      },
    },
  },
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
    console.log(` Đã build thành công tài liệu Swagger cho [${service.name}]`);
  });
}
