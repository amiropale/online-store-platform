import express from "express";
import dotenv from "dotenv";
import { connectRedis } from "./queue/redis";
import { startNotificationWorker } from "./services/notification.service";
import { securityMiddleware } from "./middlewares/security.middleware";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

async function startServer() {
  try {
    await connectRedis();
    logger.info("✅ Connected to Redis");

    await startNotificationWorker();
    logger.info("📨 Notification worker started");

    app.use(express.json());
    app.use(securityMiddleware);

    app.get("/health", (_req, res) => res.status(200).send("OK"));

    app.listen(PORT, () => {
      logger.info(`🚀 Notification Service listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();