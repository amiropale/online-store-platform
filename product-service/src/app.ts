import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createClient } from "redis";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import { securityMiddleware } from "./middlewares/security.middleware";

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
    console.log("✅ Connected to MongoDB");

    await redisClient.connect();
    console.log("✅ Connected to Redis");

    await esClient.ping();
    console.log("✅ Connected to Elasticsearch");

    app.use(express.json());
    app.use(securityMiddleware);

    app.use("/api/products", productRoutes);
    app.use("/api/cart", cartRoutes);

    app.get("/", (req, res) => {
      res.send("🟢 Product Service is running.");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Product service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();