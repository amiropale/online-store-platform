import { Request, Response } from "express";
import { Payment } from "../models/payment.model";
import { redisClient } from "../redis/client";
import { esClient } from "../elasticsearch/client";

export const confirmPayment = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { orderId, amount } = req.body;

  if (!user || !user.userId) {
    return res.status(401).json({ message: "User data missing in token" });
  }

  if (!orderId || !amount) {
    return res.status(400).json({ message: "Missing orderId or amount in request body" });
  }

  try {
    const payment = new Payment({
      userId: user.userId,
      userEmail: user.email,
      orderId,
      amount,
      status: "completed"
    });

    const saved = await payment.save();

    await redisClient.set(`payment:${saved._id}`, JSON.stringify(saved));

    const { _id, ...docWithoutId } = saved.toObject();

    await esClient.index({
      index: "payments",
      id: saved._id.toString(),
      document: docWithoutId,
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      message: "Payment confirmation failed",
      error: err,
    });
  }
};

export const getMyPayments = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user || !user.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const payments = await Payment.find({ userId: user.userId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({
      message: "Fetching payments failed",
      error: err,
    });
  }
};

export const searchPayments = async (req: Request, res: Response) => {
  const rawQuery = req.query.query;

  if (!rawQuery || typeof rawQuery !== "string") {
    return res.status(400).json({
      message: "Query parameter is required and must be a string."
    });
  }

  try {
    const result = await esClient.search({
      index: "payments",
      query: {
        multi_match: {
          query: rawQuery,
          fields: ["userId", "orderId", "status"],
        },
      },
    });

    const hits = result.hits.hits.map((hit: any) => hit._source);
    res.json(hits);
  } catch (err) {
    res.status(500).json({
      message: "Search failed",
      error: err,
    });
  }
};