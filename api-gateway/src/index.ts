import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import { logger } from "./utils/logger.js";
import { securityMiddleware } from "./middlewares/security.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || "redis"}:${process.env.REDIS_PORT || "6379"}`,
});

redisClient.on("error", (err) => {
  logger.error("❌ Redis Client Error:", err);
});

app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(securityMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", service: "API Gateway" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// ----------------------------
// ✅ Start server function
// ----------------------------
async function startServer() {
  try {
    await redisClient.connect();

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      store: new RedisStore({
        sendCommand: (...args: [string, ...string[]]) => redisClient.sendCommand(args),
      }),
    });

    app.use(limiter);

    app.listen(PORT, () => {
      logger.info(`🚀 API Gateway listening on port ${PORT}`);
    });

  } catch (err) {
    logger.error("❌ Failed to start API Gateway", err);
    process.exit(1);
  }
}

startServer();