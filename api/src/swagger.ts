import swaggerAutogen from "swagger-autogen";

const services = [
  {
    name: "User Service",
    description: "Tài liệu API của riêng Module Users",
    basePath: "/api/users", // Dùng basePath để thư viện tự cộng chuỗi
    outputFile: "./src/modules/user/docs/swagger-user.json",
    routerFiles: ["./src/modules/user/routes/UserRouter.ts"],
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
  };
  autogen(service.outputFile, service.routerFiles, doc).then(() => {
    console.log(
      ` Đã build thành công tài liệu Swagger cho [${service.name}]`,
    );
  });
}
