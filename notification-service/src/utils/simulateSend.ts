import { NotificationPayload } from "../types/notification";

// Simulate sending notification (replace with real logic later)
export const sendNotification = async (payload: NotificationPayload) => {
  console.log(`📣 Sending ${payload.type} to ${payload.recipient}: ${payload.message}`);
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate delay
  console.log(`✅ Notification sent to ${payload.recipient}`);
};