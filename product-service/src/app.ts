import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createClient } from "redis";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import { securityMiddleware } from "./middlewares/security.middleware";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

const esClient = new ElasticClient({
  node: process.env.ELASTICSEARCH_NODE,
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    logger.info("✅ Connected to MongoDB");

    await redisClient.connect();
    logger.info("✅ Connected to Redis");

    await esClient.ping();
    logger.info("✅ Connected to Elasticsearch");

    app.use(express.json());
    app.use(securityMiddleware);

    app.get("/health", (_req, res) => res.status(200).send("OK"));

    app.use("/api/products", productRoutes);
    app.use("/api/cart", cartRoutes);

    app.listen(PORT, () => {
      logger.info(`🚀 Product service listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();