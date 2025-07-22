import express from "express";
import dotenv from "dotenv";
import { connectRedis } from "./queue/redis";
import { startNotificationWorker } from "./services/notification.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.get("/", (req, res) => {
  res.send("🔔 Notification Service is running...");
});

app.listen(PORT, async () => {
  console.log(`🔔 Notification Service listening on port ${PORT}`);
  await connectRedis();
  await startNotificationWorker();
});