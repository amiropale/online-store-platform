import { Request, Response } from "express";
import { esClient } from "../elasticsearch/client";

export const searchOrders = async (req: Request, res: Response) => {
  const { userId, status, fromDate, toDate } = req.query;

  const must: any[] = [];

  if (userId) {
    must.push({ match: { userId } });
  }

  if (status) {
    must.push({ match: { status } });
  }

  if (fromDate || toDate) {
    must.push({
      range: {
        createdAt: {
          gte: fromDate || "1970-01-01",
          lte: toDate || "now",
        },
      },
    });
  }

  try {
    const { hits } = await esClient.search({
      index: "orders",
      query: {
        bool: {
          must,
        },
      },
    });

    const results = hits.hits.map((hit) => hit._source);
    res.json(results);
  } catch (err) {
    console.error("❌ Elasticsearch search error:", err);
    res.status(500).json({ message: "Search failed", error: err });
  }
};