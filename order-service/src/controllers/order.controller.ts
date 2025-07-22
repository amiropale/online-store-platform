import { Request, Response } from "express";
import { Order } from "../models/order.model";
import { redisClient } from "../redis/client";
import { esClient } from "../elasticsearch/client";
import { checkProductAvailability } from "../utils/productClient";

export const createOrder = async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const userEmail = (req as any).user?.email;
  const userId = (req as any).user?.userId;

  if (!userEmail || !userId) {
    return res.status(400).json({ message: "User data missing in token" });
  }

  for (const item of req.body.products) {
    const available = await checkProductAvailability(item.productId, item.quantity, token);
    if (!available) {
      return res.status(400).json({
        message: `Product ${item.productId} is not available in required quantity.`,
      });
    }
  }

  try {
    const order = new Order({
      userId,
      userEmail,
      products: req.body.products,
      totalPrice: req.body.totalPrice,
    });

    const saved = await order.save();

    await redisClient.set(`order:${saved._id}`, JSON.stringify(saved));

    await esClient.index({
      index: "orders",
      id: saved._id.toString(),
      document: saved.toObject(),
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // First try Redis cache
    const cached = await redisClient.get(`order:${id}`);
    if (cached) return res.json(JSON.parse(cached));

    // If not cached, get from DB
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Cache it for next time
    await redisClient.set(`order:${id}`, JSON.stringify(order));

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });

    await redisClient.del(`order:${id}`);
    await esClient.delete({ index: "orders", id });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) return res.status(404).json({ message: "Order not found" });

    await redisClient.set(`order:${id}`, JSON.stringify(updated));
    await esClient.index({
      index: "orders",
      id,
      document: updated.toObject(),
    });

    // Push notification payload to Redis queue
    const notification = {
      type: "email", // or "sms" or "push"
      recipient: updated.userEmail || "user@example.com", // simulated recipient, must be replaced with actual user email via user-service
      message: `Your order #${updated._id} status has been changed to "${updated.status}".`,
    };

    await redisClient.rPush("notifications", JSON.stringify(notification));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};