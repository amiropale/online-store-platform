import { Request, Response } from "express";
import { Order } from "../models/order.model";
import { redisClient } from "../redis/client";
import { esClient } from "../elasticsearch/client";
import { checkProductAvailability } from "../utils/productClient";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  const token = req.headers.authorization || "";

  const userEmail = req.user?.email;
  const userId = req.user?.userId;

  if (!userEmail || !userId) {
    return res.status(400).json({ message: "User data missing in token" });
  }

  for (const item of req.body.items) {
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
      products: req.body.items,
      totalPrice: req.body.totalPrice,
    });

    const saved = await order.save();

    const plainOrder = saved.toObject() as any;

    const { _id, __v, ...orderData } = plainOrder;

    orderData.products = orderData.products.map((product: any) => {
      const { _id, ...rest } = product;
      return rest;
    });

    await redisClient.set(`order:${saved._id}`, JSON.stringify({ _id: saved._id, ...orderData }));

    await esClient.index({
      index: "orders",
      id: _id.toString(),
      document: orderData,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
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
    const cached = await redisClient.get(`order:${id}`);
    if (cached) return res.json(JSON.parse(cached));

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const plainOrder = order.toObject() as any;
    const { _id, __v, ...orderData } = plainOrder;

    orderData.products = orderData.products.map((product: any) => {
      const { _id, ...rest } = product;
      return rest;
    });

    await redisClient.set(`order:${id}`, JSON.stringify({ _id: order._id, ...orderData }));

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

    const plainOrder = updated.toObject() as any;
    const { _id, __v, ...orderData } = plainOrder;

    orderData.products = orderData.products.map((product: any) => {
      const { _id, ...rest } = product;
      return rest;
    });

    await redisClient.set(`order:${id}`, JSON.stringify({ _id: updated._id, ...orderData }));

    await esClient.index({
      index: "orders",
      id,
      document: orderData,
    });

    const notification = {
      type: "email",
      recipient: updated.userEmail || "user@example.com",
      message: `Your order #${updated._id} status has been changed to "${updated.status}".`,
    };

    await redisClient.rPush("notifications", JSON.stringify(notification));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};