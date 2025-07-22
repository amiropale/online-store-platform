import { Request, Response } from "express";
import { Product } from "../models/product.model";
import { redisClient } from "../redis/client";
import { esClient } from "../elasticsearch/client";

const PRODUCT_CACHE_KEY = "top_products";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // Index product in Elasticsearch with autocomplete
    await esClient.index({
      index: "products",
      id: product._id.toString(),
      document: {
        name: {
          input: product.name, // autocomplete field
        },
        description: product.description,
        price: product.price,
        category: product.category,
        inStock: product.inStock,
      },
    });

    await redisClient.del(PRODUCT_CACHE_KEY);

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const cached = await redisClient.get(PRODUCT_CACHE_KEY);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const products = await Product.find().sort({ createdAt: -1 });

    await redisClient.set(PRODUCT_CACHE_KEY, JSON.stringify(products), {
      EX: 60,
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    // Reindex updated product with autocomplete
    await esClient.index({
      index: "products",
      id,
      document: {
        name: {
          input: updated.name,
        },
        description: updated.description,
        price: updated.price,
        category: updated.category,
        inStock: updated.inStock,
      },
    });

    await redisClient.del("top_products");

    res.json(updated);
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Product not found" });

    await esClient.delete({
      index: "products",
      id,
    });

    await redisClient.del("top_products");

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const decreaseStock = async (req: Request, res: Response) => {
  const { items } = req.body;

  try {
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found.` });
      }

      if (product.inStock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      product.inStock -= item.quantity;
      await product.save();
    }

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error("❌ Stock update error:", err);
    res.status(500).json({ message: "Stock update failed", error: err });
  }
};