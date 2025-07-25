import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const esClient = new Client({ node: process.env.ELASTICSEARCH_NODE });

const createProductIndex = async () => {
  try {
    const exists = await esClient.indices.exists({ index: "products" });

    if (!exists) {
      await esClient.indices.create({
        index: "products",
        body: {
          mappings: {
            properties: {
              name: {
                type: "completion"
              },
              fullName: {
                type: "text"
              },
              description: { type: "text" },
              price: { type: "float" },
              category: { type: "keyword" },
              inStock: { type: "integer" },
            },
          },
        },
      });

      console.log("✅ Product index with autocomplete created.");
    } else {
      console.log("ℹ️ Product index already exists.");
    }
  } catch (error) {
    console.error("❌ Error creating product index:", error);
  }
};

createProductIndex();