import { env } from "./config/env.js";
import app from "./app.js";
const PORT = env.PORT
const NODE_ENV = env.NODE_ENV

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} env ${NODE_ENV}`);
});

process.on("SIGINT", () => {
    server.close(() => console.log('Exit express'))
})