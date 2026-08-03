import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function setupSwaggerUi(app) {
    const readSwaggerDoc = (moduleName) => {
        return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "modules", moduleName, "docs", `swagger-${moduleName}.json`), "utf8"));
    };
    const userSwaggerDoc = readSwaggerDoc("user");
    const authSwaggerDoc = readSwaggerDoc("auth");
    const hotelSwaggerDoc = readSwaggerDoc("hotel");
    const bookingSwaggerDoc = readSwaggerDoc("booking");
    const reviewSwaggerDoc = readSwaggerDoc("review");
    const statisticsSwaggerDoc = readSwaggerDoc("statistics");
    const notificationSwaggerDoc = readSwaggerDoc("notification");
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
                { url: "/api-docs/swagger-user.json", name: "User Service" },
                { url: "/api-docs/swagger-auth.json", name: "Auth Service" },
                { url: "/api-docs/swagger-hotel.json", name: "Hotel Service" },
                { url: "/api-docs/swagger-booking.json", name: "Booking Service" },
                { url: "/api-docs/swagger-review.json", name: "Review Service" },
                { url: "/api-docs/swagger-statistics.json", name: "Statistics Service" },
                { url: "/api-docs/swagger-notification.json", name: "Notification Service" }
            ],
        },
    };
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, swaggerOptions));
}
