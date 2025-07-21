import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import orderRoutes from "./routes/order.routes";
import { redisClient } from "./redis/client";
import { esClient } from "./elasticsearch/client";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

redisClient.connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((err) => {
    console.error("❌ Redis connection error:", err);
    process.exit(1);
  });

esClient.ping()
  .then(() => console.log("✅ Connected to Elasticsearch"))
  .catch((err) => {
    console.error("❌ Elasticsearch connection error:", err);
    process.exit(1);
  });

// Sample route
app.get("/", (req, res) => {
  res.send("🟢 Order Service is running.");
});

app.use("/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Order service listening on port ${PORT}`);
});