import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { prisma } from "../lib/prisma";



const app = express();

// Bảo mật ứng dụng bằng cách thêm các HTTP Security Headers
// Ví dụ: X-Content-Type-Options, Content-Security-Policy,...
app.use(helmet());

// Ghi log các HTTP Request (Method, URL, Status, Response Time,...)
// Hữu ích khi phát triển và debug API
app.use(morgan("dev"));

// Parse JSON từ request body
// Cho phép đọc req.body khi client gửi Content-Type: application/json
app.use(express.json());

// Cho phép các ứng dụng Frontend (React, Vue, Angular...) gọi API
// Có thể cấu hình origin, credentials, methods,...
app.use(cors());

// Parse Cookie từ request
// Sau khi sử dụng có thể truy cập cookie qua req.cookies
app.use(cookieParser());


export default app;
