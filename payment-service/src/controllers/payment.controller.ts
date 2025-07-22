import { Request, Response } from "express";
import { Payment } from "../models/payment.model";
import { redisClient } from "../redis/client";
import { getOrderById } from "../utils/orderClient";

export const processPayment = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const token = req.headers.authorization?.split(" ")[1] || "";

  try {
    const order = await getOrderById(orderId, token);
    const amount = order.totalPrice;
    const userId = (req as any).user.id;

    const payment = new Payment({
      orderId,
      userId,
      amount,
      status: "completed",
    });

    const saved = await payment.save();

    // Optional: Cache the payment
    await redisClient.set(`payment:${saved._id}`, JSON.stringify(saved));

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Payment failed:", err);
    res.status(500).json({ message: "Payment failed", error: err });
  }
};