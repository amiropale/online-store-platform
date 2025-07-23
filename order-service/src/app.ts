import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import orderRoutes from "./routes/order.routes";
import { redisClient } from "./redis/client";
import { esClient } from "./elasticsearch/client";
import { securityMiddleware } from "./middlewares/security.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    await redisClient.connect();
    console.log("✅ Connected to Redis");

    await esClient.ping();
    console.log("✅ Connected to Elasticsearch");

    app.use(express.json());
    app.use(securityMiddleware);

    app.use("/api/orders", orderRoutes);
    app.get("/", (req, res) => {
      res.send("🟢 Order Service is running.");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Order service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();