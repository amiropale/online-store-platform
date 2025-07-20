import { Request, Response } from "express";
import { esClient } from "../elasticsearch/client";

/**
 * Search products using Elasticsearch
 * Supported query params:
 * - q: keyword to search (full-text)
 * - category: exact match filter
 * - minPrice / maxPrice: range filter
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    const must: any[] = [];

    // Full-text search on name and description
    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ["name", "description"],
          fuzziness: "auto", // smart typo handling
        },
      });
    }

    // Category filter
    if (category) {
      must.push({
        match: {
          category,
        },
      });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      must.push({
        range: {
          price: {
            gte: minPrice ? Number(minPrice) : 0,
            lte: maxPrice ? Number(maxPrice) : 1_000_000,
          },
        },
      });
    }

    const result = await esClient.search({
      index: "products",
      query: {
        bool: {
          must,
        },
      },
    });


    const hits = result.hits.hits.map((hit: any) => hit._source);

    res.json(hits);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};