import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalLimiter } from "@/middlewares/rateLimitMiddleware";
import { errorHandler } from "@/middlewares/errorMiddleware";
import userRouter from "@/modules/user/routes/userRouter";
import authRouter from "@/modules/auth/routes/authRouter";
import hotelRouter from "@/modules/hotel/routes/hotelRouter";
import roomTypeRouter from "@/modules/hotel/routes/roomTypeRouter";
import roomRouter from "@/modules/hotel/routes/roomRouter";
import bookingRouter from "@/modules/booking/routes/bookingRouter";
import paymentRouter from "@/modules/payment/routes/paymentRouter";
import searchRouter from "@/modules/search/routes/searchRouter";
import { DestinationRouter } from "@/modules/destination/routes/destinationRouter";
import { ReviewRouter } from "@/modules/review/routes/reviewRouter";
import { StatisticsRouter } from "@/modules/statistics/routes/statisticsRouter";
import { NotificationRouter } from "@/modules/notification/routes/notificationRouter";
import aiRouter from "@/modules/ai/routers/aiRouter";
import { setupSwaggerUi } from "@/config/swagger-ui";
import { env } from "@/config/env";


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

setupSwaggerUi(app);

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
app.use("/api/ai", aiRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/error", (req, res) => {
  throw new Error("Test Error");
});


app.use(errorHandler);

export default app;
