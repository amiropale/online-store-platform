import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createClient } from "redis";
import { Client as ElasticClient } from "@elastic/elasticsearch";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});
redisClient.connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((err) => {
    console.error("❌ Redis connection error:", err);
    process.exit(1);
  });

const esClient = new ElasticClient({
  node: process.env.ELASTICSEARCH_NODE,
});
esClient.ping()
  .then(() => console.log("✅ Connected to Elasticsearch"))
  .catch((err) => {
    console.error("❌ Elasticsearch connection error:", err);
    process.exit(1);
  });

// Sample route
app.get("/", (req, res) => {
  res.send("🟢 Product Service is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Product service listening on port ${PORT}`);
});