import { Request, Response } from "express";
import { esClient } from "../elasticsearch/client";
import { IUser } from "../types/user.interface";

export const searchUsers = async (req: Request, res: Response) => {
  const q = (req.query.q as string) || "";
  if (!q) return res.status(400).json({ error: "Query param 'q' required" });

  const result = await esClient.search({
    index: "users",
    query: {
      wildcard: { email: `*${q.toLowerCase()}*` },
    },
    size: 20,
  });

  const hits = result.hits.hits.map((h) => {
    const source = h._source as IUser;
    return {
    id: h._id,
    ...source,
    };
  });


  res.json(hits);
};