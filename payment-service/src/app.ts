import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createClient } from "redis";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import paymentRoutes from "./routes/payment.routes";
import { securityMiddleware } from "./middlewares/security.middleware";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

export const esClient = new ElasticClient({
  node: process.env.ELASTICSEARCH_NODE,
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    logger.info("✅ MongoDB connected");

    await redisClient.connect();
    logger.info("✅ Redis connected");

    await esClient.ping();
    logger.info("✅ Elasticsearch connected");

    app.use(express.json());
    app.use(securityMiddleware);

    app.use("/api/payments", paymentRoutes);
    app.get("/", (req, res) => res.send("🟢 Payment Service is running"));

    app.listen(PORT, () => {
      logger.info(`🚀 Payment service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();