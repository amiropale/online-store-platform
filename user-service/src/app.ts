import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { connectRedis } from "./redis/client";
import { initUserIndex } from "./elasticsearch/initIndex";
import { securityMiddleware } from "./middlewares/security.middleware";
import { logger } from "./utils/logger";

dotenv.config();

const startServer = async () => {
  try {
    await connectRedis();
    await initUserIndex();

    await mongoose.connect(process.env.MONGO_URI as string);
    logger.info("✅ Connected to MongoDB");

    const app = express();

    app.use(express.json());

    app.use(securityMiddleware);

    app.get("/health", (_req, res) => {
      res.status(200).json({ status: "ok", service: "user-service" });
    });

    app.use("/api/auth", authRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`🚀 User Service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();