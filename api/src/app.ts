import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorMiddleware";
import userRouter from "./modules/user/routes/UserRouter";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const userSwaggerDoc = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "modules", "user", "docs", "swagger-user.json"),
    "utf8",
  ),
);

app.get("/api-docs/swagger-user.json", (req, res) => res.json(userSwaggerDoc));

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: "/api-docs/swagger-user.json",
        name: "User Service",
      },
      // { url: "/api-docs/swagger-auth.json", name: "Auth Service" }
    ],
  },
};


app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, swaggerOptions),
);

app.use("/api/users", userRouter);

app.get("/error", (req, res) => {
  throw new Error("Test Error");
});

app.use(errorHandler);

export default app;
