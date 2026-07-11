import swaggerAutogen from "swagger-autogen";

const services = [
  {
    name: "User Service",
    description: "Tài liệu API của riêng Module Users",
    basePath: "/api/users",
    outputFile: "./src/modules/user/docs/swagger-user.json",
    routerFiles: ["./src/modules/user/routes/UserRouter.ts"],
    components: {}, // Có thể bổ sung schema của User vào đây sau này nếu cần
  },
  {
    name: "Auth Service",
    description: "Tài liệu API của riêng Module Auth",
    basePath: "/api/auth",
    outputFile: "./src/modules/auth/docs/swagger-auth.json",
    routerFiles: ["./src/modules/auth/routes/AuthRouter.ts"],
  
    components: {
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
      },
    },
  },
];

const autogen = swaggerAutogen({ openapi: "3.0.0" });

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
