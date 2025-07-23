import express from "express";
import dotenv from "dotenv";
import { connectRedis } from "./queue/redis";
import { startNotificationWorker } from "./services/notification.service";
import { securityMiddleware } from "./middlewares/security.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

async function startServer() {
  try {
    await connectRedis();
    console.log("✅ Connected to Redis");

    await startNotificationWorker();
    console.log("📨 Notification worker started");

    app.use(express.json());
    app.use(securityMiddleware);

    app.get("/", (req, res) => {
      res.send("🔔 Notification Service is running...");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Notification Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();