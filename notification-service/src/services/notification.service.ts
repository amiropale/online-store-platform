import { redisClient, QUEUE_NAME } from "../queue/redis";
import { sendNotification } from "../utils/simulateSend";

export const startNotificationWorker = async () => {
  console.log("🚀 Notification worker started...");

  while (true) {
    const data = await redisClient.blPop(QUEUE_NAME, 0); // blocking pop

    if (data) {
      try {
        const payload = JSON.parse(data.element);
        await sendNotification(payload);
      } catch (err) {
        console.error("❌ Failed to process notification:", err);
      }
    }
  }
};