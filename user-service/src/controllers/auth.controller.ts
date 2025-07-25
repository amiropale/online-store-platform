import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateToken } from "../utils/jwt";
import redisClient from "../redis/client";
import { esClient } from "../elasticsearch/client";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.create({ email, password });

    try {
      await esClient.index({
        index: "users",
        id: user._id.toString(),
        document: {
          email: user.email,
          createdAt: new Date(),
        },
      });
    } catch (esError) {
      console.warn("⚠️ Failed to index user in Elasticsearch:", esError);
    }

    res.status(201).json({ message: "User created", userId: user._id });
  } catch (err) {
    res.status(400).json({ error: "User already exists or invalid data" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
  userId: user._id.toString(),
  email: user.email,
});

    await redisClient.set(
      `session:${user._id}`,
      JSON.stringify({
        userId: user._id,
        loginAt: Date.now(),
      }),
      {
        EX: 60 * 60, // expires in 1 hour
      }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const email = (req as any).user?.email;

  res.status(200).json({
    message: `Welcome user ${userId}`,
    email,
  });
};