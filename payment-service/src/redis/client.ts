import { createClient } from "redis";

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((err) => {
    console.error("❌ Redis connection failed:", err);
    process.exit(1);
  });