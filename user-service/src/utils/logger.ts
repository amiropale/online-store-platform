import { createLogger, format, transports } from "winston";
import path from "path";

const logFormat = format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join("logs", "error.log"), level: "error" }),
    new transports.File({ filename: path.join("logs", "combined.log") })
  ]
});