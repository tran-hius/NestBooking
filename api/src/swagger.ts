import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "User Service API",
    description: "User Service Documentation",
  },
  host: "localhost:3000",
  basePath: "", // 💡 Để trống ở đây để swagger hiển thị full path ở danh sách bên dưới
  schemes: ["http"],
};

const outputFile = "./src/swagger-output.json";

const endpointsFiles = [
  "./src/app.ts", // 💡 Trỏ trực tiếp tới file cấu hình Express gốc của dự án (hoặc server.ts / index.ts)
];

swaggerAutogen()(outputFile, endpointsFiles, doc);
