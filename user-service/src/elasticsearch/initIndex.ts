import { esClient } from "./client";

export const initUserIndex = async () => {
  const indexExists = await esClient.indices.exists({ index: "users" });
  if (!indexExists) {
    await esClient.indices.create({
      index: "users",
      mappings: {
        properties: {
          email: { type: "keyword" },
          createdAt: { type: "date" },
        },
      },
    });
    console.log("✅ ElasticSearch index 'users' created");
  }
};