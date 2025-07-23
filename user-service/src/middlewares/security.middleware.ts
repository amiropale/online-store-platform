import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

const methodCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({ message: "Method not allowed" });
  }
  next();
};

export const securityMiddleware = [
  helmet(),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  }),
  methodCheckMiddleware,
];