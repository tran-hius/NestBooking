import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalLimiter } from "@/middlewares/rateLimitMiddleware";
import { errorHandler } from "@/middlewares/errorMiddleware";
import userRouter from "@/modules/user/routes/UserRouter";
import authRouter from "@/modules/auth/routes/authRouter";
import hotelRouter from "@/modules/hotel/routes/HotelRouter";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(globalLimiter);
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", process.env.CLIENT_URL || ""],
  credentials: true,
}));
app.use(cookieParser());

const userSwaggerDoc = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "modules", "user", "docs", "swagger-user.json"),
    "utf8",
  ),
);

const authSwaggerDoc = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "modules", "auth", "docs", "swagger-auth.json"),
    "utf-8"
  )
)

const hotelSwaggerDoc = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "modules", "hotel", "docs", "swagger-hotel.json"),
    "utf-8"
  )
)

app.get("/api-docs/swagger-user.json", (req, res) => res.json(userSwaggerDoc));
app.get("/api-docs/swagger-auth.json", (req, res) => res.json(authSwaggerDoc));
app.get("/api-docs/swagger-hotel.json", (req, res) => res.json(hotelSwaggerDoc));

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
      }
    ],
  },
};

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, swaggerOptions),
);

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/hotels", hotelRouter);

app.get("/error", (req, res) => {
  throw new Error("Test Error");
});


app.use(errorHandler);

export default app;
