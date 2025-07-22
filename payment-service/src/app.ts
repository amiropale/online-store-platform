import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createClient } from "redis";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import paymentRoutes from "./routes/payment.routes";

dotenv.config();

const app = express();
app.use(express.json());

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

app.get("/", (req, res) => res.send("🟢 Payment Service is running"));

app.use("/payments", paymentRoutes);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB connected");

    await redisClient.connect();
    console.log("✅ Redis connected");

    await esClient.ping();
    console.log("✅ Elasticsearch connected");

    app.listen(PORT, () => {
      console.log(`🚀 Payment service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();