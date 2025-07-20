import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../redis/client";

interface JwtPayload {
  id: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const session = await redisClient.get(`session:${decoded.id}`);
    if (!session) {
      return res.status(401).json({ error: "Session expired or not found" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token or session" });
  }
};