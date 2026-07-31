import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import userRouter from "./modules/user/routes/userRouter.js";
import authRouter from "./modules/auth/routes/authRouter.js";
import hotelRouter from "./modules/hotel/routes/hotelRouter.js";
import roomTypeRouter from "./modules/hotel/routes/roomTypeRouter.js";
import roomRouter from "./modules/hotel/routes/roomRouter.js";
import bookingRouter from "./modules/booking/routes/bookingRouter.js";
import paymentRouter from "./modules/payment/routes/paymentRouter.js";
import searchRouter from "./modules/search/routes/searchRouter.js";
import { DestinationRouter } from "./modules/destination/routes/destinationRouter.js";
import { ReviewRouter } from "./modules/review/routes/reviewRouter.js";
import { StatisticsRouter } from "./modules/statistics/routes/statisticsRouter.js";
import { NotificationRouter } from "./modules/notification/routes/notificationRouter.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(helmet());
// app.use(globalLimiter);
app.use(morgan("dev"));
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", process.env.CLIENT_URL || ""],
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser(env.COOKIE_SECRET));
const userSwaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "modules", "user", "docs", "swagger-user.json"), "utf8"));
const authSwaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "modules", "auth", "docs", "swagger-auth.json"), "utf-8"));
const hotelSwaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "modules", "hotel", "docs", "swagger-hotel.json"), "utf-8"));
const bookingSwaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "modules", "booking", "docs", "swagger-booking.json"), "utf-8"));
const reviewSwaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "modules", "review", "docs", "swagger-review.json"), "utf-8"));
const statisticsSwaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "modules", "statistics", "docs", "swagger-statistics.json"), "utf-8"));
const notificationSwaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "modules", "notification", "docs", "swagger-notification.json"), "utf-8"));
app.get("/api-docs/swagger-user.json", (req, res) => res.json(userSwaggerDoc));
app.get("/api-docs/swagger-auth.json", (req, res) => res.json(authSwaggerDoc));
app.get("/api-docs/swagger-hotel.json", (req, res) => res.json(hotelSwaggerDoc));
app.get("/api-docs/swagger-booking.json", (req, res) => res.json(bookingSwaggerDoc));
app.get("/api-docs/swagger-review.json", (req, res) => res.json(reviewSwaggerDoc));
app.get("/api-docs/swagger-statistics.json", (req, res) => res.json(statisticsSwaggerDoc));
app.get("/api-docs/swagger-notification.json", (req, res) => res.json(notificationSwaggerDoc));
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        urls: [
            {
                url: "/api-docs/swagger-user.json",
                name: "User Service",
            },
            { url: "/api-docs/swagger-auth.json",
                name: "Auth Service"
            },
            {
                url: "/api-docs/swagger-hotel.json",
                name: "Hotel Service"
            },
            {
                url: "/api-docs/swagger-booking.json",
                name: "Booking Service"
            },
            {
                url: "/api-docs/swagger-review.json",
                name: "Review Service"
            },
            {
                url: "/api-docs/swagger-statistics.json",
                name: "Statistics Service"
            },
            {
                url: "/api-docs/swagger-notification.json",
                name: "Notification Service"
            }
        ],
    },
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, swaggerOptions));
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/room-types", roomTypeRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/search", searchRouter);
app.use("/api/destinations", DestinationRouter);
app.use("/api/reviews", ReviewRouter);
app.use("/api/statistics", StatisticsRouter);
app.use("/api/notifications", NotificationRouter);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});
app.get("/error", (req, res) => {
    throw new Error("Test Error");
});
app.use(errorHandler);
export default app;
