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

    // Full-text search on fullName and description
    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ["fullName", "description"],
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

// Auto-complete search using Elasticsearch completion suggester
export const autocompleteProducts = async (req: Request, res: Response) => {
  const { input } = req.query;

  if (!input || typeof input !== "string") {
    return res.status(400).json({ message: "Query input is required" });
  }

  try {
    const result = await esClient.search({
      index: "products",
      suggest: {
        product_suggest: {
          prefix: input,
          completion: {
            field: "name",
            fuzzy: {
              fuzziness: "auto",
            },
          },
        },
      },
    });

    const options = result.suggest?.product_suggest?.[0]?.options as any[];

    const suggestions = options.map((opt: any) => opt.text);

    res.json({ suggestions });
  } catch (err) {
    console.error("❌ Autocomplete error:", err);
    res.status(500).json({ message: "Autocomplete failed", error: err });
  }
};