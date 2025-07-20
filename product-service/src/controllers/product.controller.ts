import { Request, Response } from "express";
import { Product } from "../models/product.model";
import { redisClient } from "../redis/client";
import { esClient } from "../elasticsearch/client";

const PRODUCT_CACHE_KEY = "top_products";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();

    await esClient.index({
      index: "products",
      id: product._id.toString(),
      document: {
        name: product.name,
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