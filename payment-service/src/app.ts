import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createClient } from "redis";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import paymentRoutes from "./routes/payment.routes";
import { securityMiddleware } from "./middlewares/security.middleware";

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
    console.log("✅ MongoDB connected");

    await redisClient.connect();
    console.log("✅ Redis connected");

    await esClient.ping();
    console.log("✅ Elasticsearch connected");

    app.use(express.json());
    app.use(securityMiddleware);

    app.use("/api/payments", paymentRoutes);
    app.get("/", (req, res) => res.send("🟢 Payment Service is running"));

    app.listen(PORT, () => {
      console.log(`🚀 Payment service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();