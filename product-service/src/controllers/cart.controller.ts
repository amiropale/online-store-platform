import { Request, Response } from "express";
import { redisClient } from "../redis/client";
import axios from "axios";

export const addToCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { productId, quantity } = req.body;

  const key = `cart:${userId}`;

  try {
    const cartData = await redisClient.get(key);
    let cart = cartData ? JSON.parse(cartData) : [];

    const existing = cart.find((item: any) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    await redisClient.set(key, JSON.stringify(cart));

    res.status(200).json({ message: "Added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Error updating cart", error: err });
  }
};

export const getCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const key = `cart:${userId}`;

  try {
    const cartData = await redisClient.get(key);
    const cart = cartData ? JSON.parse(cartData) : [];

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { productId } = req.params;
  const key = `cart:${userId}`;

  try {
    const cartData = await redisClient.get(key);
    let cart = cartData ? JSON.parse(cartData) : [];

    cart = cart.filter((item: any) => item.productId !== productId);

    await redisClient.set(key, JSON.stringify(cart));
    res.json({ message: "Removed from cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Error removing item", error: err });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const key = `cart:${userId}`;

  try {
    await redisClient.del(key);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Error clearing cart", error: err });
  }
};

export const checkoutCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const key = `cart:${userId}`;
  const token = req.headers.authorization;

  try {
    const cartData = await redisClient.get(key);
    const cart = cartData ? JSON.parse(cartData) : [];

    if (cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    let totalPrice = 0;
    const detailedProducts = [];

    for (const item of cart) {
      const res = await axios.get(`http://product-service:3002/products/${item.productId}`, {
        headers: { Authorization: token || "" },
      });

      const product = res.data;
      if (product.inStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }
      totalPrice += product.price * item.quantity;
      detailedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    const orderResponse = await axios.post(
      "http://order-service:3003/orders",
      {
        userId,
        products: detailedProducts,
        totalPrice,
      },
      {
        headers: { Authorization: token || "" },
      }
    );

    await axios.post(
      "http://product-service:3002/products/decrease-stock",
      {
        items: detailedProducts,
      },
      {
        headers: { Authorization: token || "" },
      }
    );

    await redisClient.del(key);

    res.status(201).json({
      message: "Checkout successful. Order created.",
      order: orderResponse.data,
    });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ message: "Checkout failed", error: err });
  }
};