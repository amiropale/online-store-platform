import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { connectRedis } from "./redis/client";
import { initUserIndex } from "./elasticsearch/initIndex";
import { securityMiddleware } from "./middlewares/security.middleware";
import { logger } from "./utils/logger";

dotenv.config();

(async () => {
  try {
    await connectRedis();
    await initUserIndex();
    await mongoose.connect(process.env.MONGO_URI as string);
    logger.info("✅ Connected to MongoDB");

    const app = express();
    app.use(express.json());

    app.use(securityMiddleware);
    app.use("/api/auth", authRoutes);

    app.listen(3000, () => {
      logger.info("🚀 User Service running on port 3000");
    });
  } catch (err) {
    logger.error("❌ Startup error:", err);
  }
})();