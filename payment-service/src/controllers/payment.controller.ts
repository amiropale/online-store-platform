import { Request, Response } from "express";
import { Payment } from "../models/payment.model";
import { redisClient } from "../redis/client";
import { esClient } from "../elasticsearch/client";

export const confirmPayment = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { orderId, amount } = req.body;

  try {
    const payment = new Payment({ userId, orderId, amount, status: "confirmed" });
    const saved = await payment.save();

    await redisClient.set(`payment:${saved._id}`, JSON.stringify(saved));

    await esClient.index({
      index: "payments",
      id: saved._id.toString(),
      document: saved.toObject(),
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Payment confirmation failed", error: err });
  }
};

export const getMyPayments = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const payments = await Payment.find({ userId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Fetching payments failed", error: err });
  }
};

export const searchPayments = async (req: Request, res: Response) => {
  const rawQuery = req.query.query;

  if (!rawQuery || typeof rawQuery !== "string") {
    return res.status(400).json({ message: "Query parameter is required and must be a string." });
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
    res.status(500).json({ message: "Search failed", error: err });
  }
};