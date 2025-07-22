import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export const QUEUE_NAME = "notifications";

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("✅ Connected to Redis (Notification Service)");
};