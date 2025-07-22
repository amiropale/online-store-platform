export interface NotificationPayload {
  type: "email" | "sms" | "push";
  recipient: string;
  message: string;
}