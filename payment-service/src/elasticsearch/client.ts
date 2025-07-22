import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE,
});

esClient.ping()
  .then(() => console.log("✅ Connected to Elasticsearch"))
  .catch((err) => {
    console.error("❌ Elasticsearch connection failed:", err);
    process.exit(1);
  });